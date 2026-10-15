'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { createInvite } from '../../auth/lib/authActions';
import { canAssignRole } from '../../auth/lib/authRBAC';
import { queueNotificationDelivery } from '../../notifications/lib/notificationsEngine';
import {
  featureFlagsSchema,
  memberRoleSchema,
  orgProfileSchema,
  subscriptionSchema,
} from '../schemas/settings.schema';

const settingsPath = '/settings';
const privilegedRoles = new Set(['OWNER', 'ADMIN', 'owner', 'admin']);

async function requireSettingsAdmin() {
  const context = await auth.requireOrgContext();
  if (!privilegedRoles.has(context.role ?? '')) {
    throw new Error('You do not have permission to manage organization settings.');
  }
  await auth.assertRole('admin');
  return context;
}

export async function updateOrgProfile(input: unknown) {
  const context = await requireSettingsAdmin();
  const data = orgProfileSchema.parse(input);
  const { name, timezone, ...rawProfile } = data;
  const profile = Object.fromEntries(
    Object.entries(rawProfile).filter(([, value]) => value !== undefined),
  ) as {
    legalName?: string | null;
    dbaName?: string | null;
    dotNumber?: string | null;
    mcNumber?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  };

  const result = await prisma.$transaction(async (tx) => {
    await tx.organization.update({
      where: { id: context.orgId },
      data: { name, timezone, updatedById: context.userId },
    });
    return tx.organizationProfile.upsert({
      where: { organizationId: context.orgId },
      create: { organizationId: context.orgId, ...profile },
      update: profile,
    });
  });

  revalidatePath(settingsPath);
  revalidatePath(`${settingsPath}/organization`);
  return result;
}

export async function updateMemberRole(input: unknown) {
  const context = await requireSettingsAdmin();
  const { membershipId, role } = memberRoleSchema.parse(input);
  const current = await prisma.organizationMembership.findFirst({
    where: { id: membershipId, organizationId: context.orgId },
    select: { id: true, userId: true, role: true, status: true },
  });
  if (!current || current.status === 'REVOKED') throw new Error('Member not found.');
  if (current.userId === context.userId)
    throw new Error('You cannot change your own organization role.');
  if (!canAssignRole(context.role, role, current.role)) {
    throw new Error('Your role cannot assign this organization role.');
  }
  if (current.role === 'OWNER' && role !== 'OWNER') {
    const owners = await prisma.organizationMembership.count({
      where: { organizationId: context.orgId, role: 'OWNER', status: 'ACTIVE' },
    });
    if (owners <= 1) throw new Error('An organization must retain at least one active owner.');
  }

  const updated = await prisma.organizationMembership.update({
    where: { id: current.id },
    data: { role },
  });
  revalidatePath(`${settingsPath}/users`);
  return updated;
}

export async function inviteMember(input: unknown) {
  const context = await requireSettingsAdmin();
  const invitation = await createInvite(input);
  const notifications = await queueNotificationDelivery({
    organizationId: context.orgId,
    type: 'SYSTEM',
    channels: ['EMAIL'],
    title: 'Organization invitation',
    body: 'You have been invited to join your FleetFusion organization.',
    payload: {
      email: invitation.email,
      inviteUrl: invitation.inviteUrl,
      role: invitation.role,
    },
  });
  revalidatePath(`${settingsPath}/users`);
  revalidatePath('/auth/invites');
  return { ...invitation, notificationId: notifications[0]?.id ?? null };
}

export async function updateSubscription(input: unknown) {
  const context = await auth.requireOrgContext();
  if (context.role?.toUpperCase() !== 'OWNER') {
    throw new Error('Only an organization owner can change the subscription plan.');
  }
  await auth.assertRole('owner');
  const { planKey } = subscriptionSchema.parse(input);
  const current = await prisma.subscription.findFirst({
    where: { organizationId: context.orgId },
    orderBy: { createdAt: 'desc' },
  });
  const subscription = current
    ? await prisma.subscription.update({
        where: { id: current.id },
        data: { planKey },
      })
    : await prisma.subscription.create({
        data: { organizationId: context.orgId, planKey, status: 'TRIALING' },
      });
  revalidatePath(`${settingsPath}/billing`);
  revalidatePath(settingsPath);
  return subscription;
}

export async function updateFeatureFlags(input: unknown) {
  const context = await requireSettingsAdmin();
  const { flags } = featureFlagsSchema.parse(input);
  const keys = Object.keys(flags);
  const planManagedFeatures = new Set([
    'dispatch',
    'fleetManagement',
    'ifta',
    'customReports',
    'apiAccess',
    'sso',
  ]);
  if (keys.some((key) => planManagedFeatures.has(key))) {
    throw new Error('Plan-managed features cannot be overridden for an organization.');
  }

  const updates = await prisma.$transaction(
    keys.map((key) =>
      prisma.featureFlag.upsert({
        where: { organizationId_key: { organizationId: context.orgId, key } },
        create: {
          organizationId: context.orgId,
          key,
          value: flags[key] ?? false,
          scope: 'ORGANIZATION',
        },
        update: { value: flags[key] ?? false },
      }),
    ),
  );
  revalidatePath(`${settingsPath}/feature-flags`);
  revalidatePath(settingsPath);
  return { flags, updatedCount: updates.length };
}
