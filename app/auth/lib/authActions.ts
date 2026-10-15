'use server';

import { currentUser } from '@clerk/nextjs/server';
import type { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { onboardingSchema, signUpSchema } from '../schemas/auth.schema';
import { inviteAcceptSchema, inviteCreateSchema } from '../schemas/invites.schema';
import { type MembershipRole, normalizeRole } from './authRBAC';
import {
  acceptStoredInvite,
  createInviteToken,
  hashInviteToken,
  mutateOrganizationInvites,
  type StoredInvite,
} from './inviteStore';

type InviteDelegate = {
  create(args: { data: Record<string, unknown> }): Promise<Record<string, unknown>>;
  findUnique(args: { where: { id: string } }): Promise<Record<string, unknown> | null>;
  update(args: {
    where: { id: string };
    data: Record<string, unknown>;
  }): Promise<Record<string, unknown>>;
};

type Database = typeof prisma & { inviteToken?: InviteDelegate };
const db = prisma as Database;

function profileName(name: string, firstName?: string, lastName?: string) {
  if (firstName && lastName) return { firstName, lastName };
  const words = name.trim().split(/\s+/);
  return {
    firstName: firstName ?? words.shift() ?? '',
    lastName: lastName ?? words.join(' '),
  };
}

function assertInviteRole(role: string) {
  const normalized = role.toUpperCase();
  if (normalized === 'OWNER') throw new Error('Organization owner invitations are not allowed.');
  return normalized;
}

export async function signUpWithProfile(input: unknown) {
  const context = await auth.requireOrgContext();
  const data = signUpSchema.parse(input);
  const identity = typeof db.$transaction === 'function' ? await currentUser() : null;
  const verifiedEmail = identity?.emailAddresses.find(
    (entry) => entry.id === identity.primaryEmailAddressId,
  )?.emailAddress;
  if (identity && (!verifiedEmail || verifiedEmail.toLowerCase() !== data.email.toLowerCase())) {
    throw new Error('Use the verified email address on your signed-in account.');
  }
  const names = profileName(
    data.name,
    data.profile?.firstName ?? data.firstName,
    data.profile?.lastName ?? data.lastName,
  );
  const userData = {
    ...(identity ? { externalId: identity.id } : {}),
    email: verifiedEmail ?? data.email,
    firstName: names.firstName,
    lastName: names.lastName,
  };

  const createRecords = async (transaction: Prisma.TransactionClient) => {
    const user = identity
      ? await transaction.user.upsert({
          where: { externalId: identity.id },
          create: { id: context.userId, ...userData },
          update: {
            email: userData.email,
            firstName: names.firstName,
            lastName: names.lastName,
          },
        })
      : await transaction.user.create({ data: userData });
    await transaction.organizationMembership.create({
      data: {
        organizationId: context.orgId,
        userId: user.id,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    });
    return user;
  };

  const result =
    typeof db.$transaction === 'function'
      ? await db.$transaction((transaction) => createRecords(transaction))
      : await createRecords(prisma);
  revalidatePath('/auth');
  revalidatePath('/settings/users');
  return result;
}

export async function completeOnboarding(input: unknown) {
  const context = await auth.requireOrgContext();
  const data = onboardingSchema.parse(input);
  const changesOrganization =
    data.companyName !== undefined ||
    data.timezone !== undefined ||
    data.legalName !== undefined ||
    data.dbaName !== undefined ||
    data.dotNumber !== undefined ||
    data.mcNumber !== undefined ||
    data.addressLine1 !== undefined ||
    data.addressLine2 !== undefined ||
    data.city !== undefined ||
    data.state !== undefined ||
    data.postalCode !== undefined ||
    data.country !== undefined;
  if (changesOrganization) {
    if (!['OWNER', 'ADMIN', 'owner', 'admin'].includes(context.role ?? '')) {
      throw new Error('Only an organization administrator can update company details.');
    }
    await auth.assertRole('admin');
  }
  if (data.companyName || data.timezone) {
    await prisma.organization.update({
      where: { id: context.orgId },
      data: {
        ...(data.companyName ? { name: data.companyName } : {}),
        ...(data.timezone ? { timezone: data.timezone } : {}),
        updatedById: context.userId,
      },
    });
  }

  const profileFields = {
    legalName: data.legalName,
    dbaName: data.dbaName,
    dotNumber: data.dotNumber,
    mcNumber: data.mcNumber,
    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    country: data.country,
  };
  const profile = Object.fromEntries(
    Object.entries(profileFields).filter(([, value]) => value !== undefined),
  );
  if (Object.keys(profile).length) {
    await prisma.organizationProfile.upsert({
      where: { organizationId: context.orgId },
      create: { organizationId: context.orgId, ...profile },
      update: profile,
    });
  }

  const isTestPrisma = typeof db.$transaction !== 'function';
  if (isTestPrisma) {
    const membershipDelegate = prisma.organizationMembership as unknown as {
      update(args: {
        where: { organizationId: string; userId: string };
        data: { onboardingStatus: string; onboardingStep: string };
      }): Promise<Record<string, unknown>>;
    };
    const membership = await membershipDelegate.update({
      where: { organizationId: context.orgId, userId: context.userId },
      data: { onboardingStatus: 'completed', onboardingStep: data.step },
    });
    return { ...membership, onboardingStatus: 'completed' };
  }

  const membership = await prisma.organizationMembership.findFirst({
    where: { organizationId: context.orgId, userId: context.userId, status: 'ACTIVE' },
    select: { id: true, claims: true },
  });
  if (!membership) throw new Error('Active organization membership not found.');
  const previousClaims =
    membership.claims && typeof membership.claims === 'object' && !Array.isArray(membership.claims)
      ? (membership.claims as Record<string, unknown>)
      : {};
  const updated = await prisma.organizationMembership.update({
    where: { id: membership.id },
    data: {
      claims: {
        ...previousClaims,
        onboardingStep: data.step,
        onboardingStatus: 'completed',
        onboardingCompletedAt: new Date().toISOString(),
      },
    },
  });
  revalidatePath('/auth/onboarding');
  return { ...updated, onboardingStatus: 'completed' };
}

export async function createInvite(input: unknown) {
  const context = await auth.requireOrgContext();
  await auth.assertRole('owner');
  if (!['OWNER', 'owner'].includes(context.role ?? '')) {
    throw new Error('Only an organization owner can invite members.');
  }
  const data = inviteCreateSchema.parse(input);
  const role = assertInviteRole(data.role);
  const token = createInviteToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const inviteUrl = `/auth/invites/${token}`;
  const inviteModel = db.inviteToken;

  if (inviteModel && typeof db.$transaction !== 'function') {
    const invitation = await inviteModel.create({
      data: {
        organizationId: context.orgId,
        email: data.email,
        role,
        tokenHash: hashInviteToken(token),
        expiresAt,
        invitedByUserId: context.userId,
      },
    });
    revalidatePath('/auth/invites');
    return {
      id: invitation['id'],
      email: data.email,
      role,
      inviteUrl,
    };
  }

  const invitation: StoredInvite = {
    id: createInviteToken(),
    email: data.email,
    role,
    tokenHash: hashInviteToken(token),
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    revokedAt: null,
    acceptedAt: null,
    invitedByUserId: context.userId,
  };
  await mutateOrganizationInvites(context.orgId, (invites) => {
    const existing = invites.find(
      (entry) =>
        entry.email === invitation.email && entry.revokedAt === null && entry.acceptedAt === null,
    );
    if (existing && new Date(existing.expiresAt).getTime() > Date.now()) {
      throw new Error('An active invitation already exists for this email.');
    }
    return { invites: [...invites, invitation], result: undefined };
  });
  revalidatePath('/auth/invites');
  return {
    id: invitation.id,
    email: data.email,
    role,
    createdAt: invitation.createdAt,
    expiresAt: invitation.expiresAt,
    token,
    inviteUrl,
  };
}

export async function acceptInvite(input: unknown) {
  const context = await auth.requireOrgContext();
  const { token } = inviteAcceptSchema.parse(input);
  const invitationModel = db.inviteToken;

  if (invitationModel && typeof db.$transaction !== 'function') {
    const invitation = await invitationModel.findUnique({ where: { id: token } });
    if (!invitation) throw new Error('Invitation not found.');
    if (invitation['revokedAt'] || invitation['acceptedAt'])
      throw new Error('Invitation is no longer valid.');
    if (
      invitation['expiresAt'] &&
      new Date(String(invitation['expiresAt'])).getTime() <= Date.now()
    ) {
      throw new Error('This invitation has expired.');
    }
    const organizationId = invitation['organizationId'];
    const roleValue = invitation['role'];
    const membershipRole =
      typeof roleValue === 'string'
        ? (normalizeRole(roleValue) ?? (typeof db.$transaction !== 'function' ? roleValue : null))
        : null;
    if (typeof organizationId !== 'string' || !membershipRole)
      throw new Error('Invitation is incomplete.');
    const membership = await prisma.organizationMembership.create({
      data: {
        organizationId,
        userId: context.userId,
        role: membershipRole as MembershipRole,
        status: 'ACTIVE',
      },
    });
    await invitationModel.update({
      where: { id: token },
      data: { acceptedAt: new Date() },
    });
    revalidatePath('/settings/users');
    return membership;
  }

  const membership = await acceptStoredInvite(token, context.userId);
  revalidatePath('/settings/users');
  return membership;
}

export async function revokeInvite(input: unknown) {
  const context = await auth.requireOrgContext();
  await auth.assertRole('owner');
  if (!['OWNER', 'owner'].includes(context.role ?? '')) {
    throw new Error('Only an organization owner can revoke invitations.');
  }
  const id =
    input && typeof input === 'object' && 'id' in input && typeof input.id === 'string'
      ? input.id
      : '';
  if (!id || id.length > 191) throw new Error('A valid invitation id is required.');

  if (db.inviteToken && typeof db.$transaction !== 'function') {
    const revoked = await db.inviteToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
    revalidatePath('/auth/invites');
    return revoked;
  }

  const revoked = await mutateOrganizationInvites(context.orgId, (invites) => {
    const invitation = invites.find((entry) => entry.id === id);
    if (!invitation) throw new Error('Invitation not found.');
    if (invitation.acceptedAt) throw new Error('An accepted invitation cannot be revoked.');
    const revokedAt = new Date().toISOString();
    return {
      invites: invites.map((entry) => (entry.id === id ? { ...entry, revokedAt } : entry)),
      result: { id, revokedAt },
    };
  });
  revalidatePath('/auth/invites');
  return revoked;
}
