import { createHash, randomBytes } from 'node:crypto';

import { prisma } from '@/lib/prisma';

export type StoredInvite = {
  id: string;
  email: string;
  role: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  acceptedAt: string | null;
  invitedByUserId: string;
};

type OrganizationDelegate = {
  findUnique(args: {
    where: { id: string };
    select: { metadata: true };
  }): Promise<{ metadata: unknown } | null>;
  findMany(args: {
    select: { id: true; name: true; metadata: true; isActive: true };
  }): Promise<Array<{ id: string; name: string; metadata: unknown; isActive: boolean }>>;
  update(args: {
    where: { id: string };
    data: { metadata: Record<string, unknown> };
  }): Promise<unknown>;
};

type Db = {
  organization: OrganizationDelegate;
  organizationMembership: {
    create(args: {
      data: {
        organizationId: string;
        userId: string;
        role: string;
        status: 'ACTIVE';
      };
    }): Promise<unknown>;
  };
  user: {
    findUnique(args: {
      where: { id: string };
      select: { id: true; email: true; status: true };
    }): Promise<{ id: string; email: string | null; status: string } | null>;
  };
  $transaction?: <T>(
    callback: (transaction: Db) => Promise<T>,
    options?: { isolationLevel: 'Serializable' },
  ) => Promise<T>;
};

export const inviteDb = prisma as unknown as Db;

export function createInviteToken() {
  return randomBytes(32).toString('base64url');
}

export function hashInviteToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function readStoredInvites(metadata: unknown): StoredInvite[] {
  const invites = asRecord(metadata)['authInvites'];
  if (!Array.isArray(invites)) return [];
  return invites.filter(
    (entry): entry is StoredInvite =>
      entry !== null &&
      typeof entry === 'object' &&
      typeof (entry as StoredInvite).id === 'string' &&
      typeof (entry as StoredInvite).email === 'string' &&
      typeof (entry as StoredInvite).role === 'string' &&
      typeof (entry as StoredInvite).tokenHash === 'string' &&
      typeof (entry as StoredInvite).expiresAt === 'string',
  );
}

export async function mutateOrganizationInvites<T>(
  orgId: string,
  mutate: (invites: StoredInvite[]) => { invites: StoredInvite[]; result: T },
): Promise<T> {
  const run = async (transaction: Db) => {
    const organization = await transaction.organization.findUnique({
      where: { id: orgId },
      select: { metadata: true },
    });
    if (!organization) throw new Error('Organization not found.');
    const metadata = asRecord(organization.metadata);
    const changed = mutate(readStoredInvites(metadata));
    await transaction.organization.update({
      where: { id: orgId },
      data: { metadata: { ...metadata, authInvites: changed.invites } },
    });
    return changed.result;
  };

  return typeof inviteDb.$transaction === 'function'
    ? inviteDb.$transaction(run, { isolationLevel: 'Serializable' })
    : run(inviteDb);
}

export async function findInviteByToken(token: string) {
  const tokenHash = hashInviteToken(token);
  const organizations = await inviteDb.organization.findMany({
    select: { id: true, name: true, metadata: true, isActive: true },
  });
  for (const organization of organizations) {
    const invite = readStoredInvites(organization.metadata).find(
      (entry) => entry.tokenHash === tokenHash,
    );
    if (invite) return { organization, invite };
  }
  return null;
}

export async function acceptStoredInvite(token: string, userId: string) {
  const run = async (transaction: Db) => {
    const tokenHash = hashInviteToken(token);
    const organizations = await transaction.organization.findMany({
      select: { id: true, name: true, metadata: true, isActive: true },
    });
    const found = organizations
      .filter((organization) => organization.isActive)
      .flatMap((organization) =>
        readStoredInvites(organization.metadata)
          .filter((invite) => invite.tokenHash === tokenHash)
          .map((invite) => ({ organization, invite })),
      )[0];
    if (!found) throw new Error('Invitation not found.');
    const { organization, invite } = found;
    if (invite.revokedAt || invite.acceptedAt) throw new Error('Invitation is no longer valid.');
    if (new Date(invite.expiresAt).getTime() <= Date.now()) {
      throw new Error('This invitation has expired.');
    }
    const validRoles = new Set([
      'ADMIN',
      'MANAGER',
      'DISPATCHER',
      'DRIVER_MANAGER',
      'COMPLIANCE_MANAGER',
      'ANALYST',
      'BILLING',
      'MEMBER',
    ]);
    if (!validRoles.has(invite.role)) throw new Error('Invitation has an invalid role.');

    const user = await transaction.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, status: true },
    });
    if (
      !user ||
      user.status !== 'ACTIVE' ||
      user.email?.toLowerCase() !== invite.email.toLowerCase()
    ) {
      throw new Error('Sign in with the email address this invitation was sent to.');
    }
    const nextInvites = readStoredInvites(organization.metadata).map((entry) =>
      entry.id === invite.id ? { ...entry, acceptedAt: new Date().toISOString() } : entry,
    );
    const metadata = asRecord(organization.metadata);
    await transaction.organization.update({
      where: { id: organization.id },
      data: { metadata: { ...metadata, authInvites: nextInvites } },
    });
    return transaction.organizationMembership.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        role: invite.role,
        status: 'ACTIVE',
      },
    });
  };

  return typeof inviteDb.$transaction === 'function'
    ? inviteDb.$transaction(run, { isolationLevel: 'Serializable' })
    : run(inviteDb);
}
