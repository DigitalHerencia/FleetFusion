import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { findInviteByToken, inviteDb, readStoredInvites } from './inviteStore';

export async function getCurrentUserWithOrgs() {
  const { userId } = await auth.requireOrgContext();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        where: { status: 'ACTIVE', organization: { isActive: true, deletedAt: null } },
        include: { organization: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  if (!user || user.status !== 'ACTIVE') throw new Error('User profile not found.');
  return user;
}

export async function getUserProfile() {
  const user = await getCurrentUserWithOrgs();
  return {
    id: user.id,
    externalId: user.externalId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    organizations: user.memberships.map((membership) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      role: membership.role,
      membershipId: membership.id,
    })),
  };
}

export async function getOnboardingState() {
  const context = await auth.requireOrgContext();
  const membership = await prisma.organizationMembership.findFirst({
    where: {
      organizationId: context.orgId,
      userId: context.userId,
      status: 'ACTIVE',
    },
    select: { claims: true },
  });
  const claims =
    membership?.claims && typeof membership.claims === 'object' && !Array.isArray(membership.claims)
      ? (membership.claims as Record<string, unknown>)
      : {};
  return {
    status:
      typeof claims['onboardingStatus'] === 'string' ? claims['onboardingStatus'] : 'incomplete',
    step:
      typeof claims['onboardingStep'] === 'string' ? claims['onboardingStep'] : 'company_profile',
    completedAt:
      typeof claims['onboardingCompletedAt'] === 'string' ? claims['onboardingCompletedAt'] : null,
  };
}

export async function getPendingInvitesForOrg() {
  const { orgId } = await auth.requireOrgContext();
  const organization = await inviteDb.organization.findUnique({
    where: { id: orgId },
    select: { metadata: true },
  });
  if (!organization) throw new Error('Organization not found.');
  const now = Date.now();
  return readStoredInvites(organization.metadata)
    .filter(
      (invite) =>
        invite.revokedAt === null &&
        invite.acceptedAt === null &&
        new Date(invite.expiresAt).getTime() > now,
    )
    .map(({ tokenHash: _tokenHash, invitedByUserId: _invitedByUserId, ...invite }) => invite);
}

export const getInvites = getPendingInvitesForOrg;

export async function getInviteByToken(token: string) {
  if (typeof token !== 'string' || token.length < 32 || token.length > 256) return null;
  const found = await findInviteByToken(token);
  if (!found) return null;
  const { organization, invite } = found;
  const expired = new Date(invite.expiresAt).getTime() <= Date.now();
  const valid = !expired && !invite.revokedAt && !invite.acceptedAt && organization.isActive;
  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    organizationId: organization.id,
    organizationName: organization.name,
    expiresAt: invite.expiresAt,
    valid,
  };
}
