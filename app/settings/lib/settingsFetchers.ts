import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

const starterFeatures: Record<string, boolean> = {
  dispatch: true,
  fleetManagement: true,
  ifta: false,
  customReports: false,
  apiAccess: false,
  sso: false,
};
const planFeatures: Record<string, Record<string, boolean>> = {
  starter: starterFeatures,
  growth: {
    dispatch: true,
    fleetManagement: true,
    ifta: true,
    customReports: true,
    apiAccess: false,
    sso: false,
  },
  enterprise: {
    dispatch: true,
    fleetManagement: true,
    ifta: true,
    customReports: true,
    apiAccess: true,
    sso: true,
  },
};

export async function getOrgProfile() {
  const { orgId } = await auth.requireOrgContext();
  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { profiles: true },
  });

  if (!organization) throw new Error('Organization not found.');
  const profile = organization.profiles[0];
  return {
    id: organization.id,
    name: organization.name,
    timezone: organization.timezone,
    legalName: profile?.legalName ?? '',
    dbaName: profile?.dbaName ?? '',
    dotNumber: profile?.dotNumber ?? '',
    mcNumber: profile?.mcNumber ?? '',
    addressLine1: profile?.addressLine1 ?? '',
    addressLine2: profile?.addressLine2 ?? '',
    city: profile?.city ?? '',
    state: profile?.state ?? '',
    postalCode: profile?.postalCode ?? '',
    country: profile?.country ?? '',
  };
}

export async function getOrgMembers() {
  const { orgId } = await auth.requireOrgContext();
  return prisma.organizationMembership.findMany({
    where: { organizationId: orgId, status: { in: ['ACTIVE', 'PENDING'] } },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          status: true,
        },
      },
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function getSubscriptionInfo() {
  const { orgId } = await auth.requireOrgContext();
  const subscription = await prisma.subscription.findFirst({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
  });
  const planKey = subscription?.planKey ?? 'starter';
  return {
    id: subscription?.id ?? null,
    tier: planKey,
    planKey,
    status: subscription?.status ?? 'TRIALING',
    renewsAt: subscription?.renewsAt ?? null,
    canceledAt: subscription?.canceledAt ?? null,
    features: planFeatures[planKey] ?? starterFeatures,
  };
}

export async function getFeatureFlags() {
  const { orgId } = await auth.requireOrgContext();
  const [subscription, flags] = await Promise.all([
    prisma.subscription.findFirst({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      select: { planKey: true },
    }),
    prisma.featureFlag.findMany({
      where: {
        OR: [
          { organizationId: orgId, scope: 'ORGANIZATION' },
          { organizationId: null, scope: 'GLOBAL' },
        ],
      },
      select: { key: true, value: true, scope: true },
    }),
  ]);

  const planKey = subscription?.planKey ?? 'starter';
  const planFlags = planFeatures[planKey] ?? starterFeatures;
  const values: Record<string, boolean> = { ...planFlags };
  for (const flag of flags) {
    if (Object.hasOwn(planFlags, flag.key)) continue;
    values[flag.key] = flag.value;
  }
  Object.assign(values, planFlags);
  return {
    flags: values,
    details: flags,
    planKey,
  };
}

export async function getSettingsDashboardSnapshot() {
  const [profile, members, subscription, featureFlags] = await Promise.all([
    getOrgProfile(),
    getOrgMembers(),
    getSubscriptionInfo(),
    getFeatureFlags(),
  ]);
  return {
    profile,
    memberCount: members.length,
    subscription,
    featureFlags,
    cards: [
      { key: 'organization', label: 'Organization', value: profile.name },
      { key: 'members', label: 'Members', value: members.length },
      { key: 'plan', label: 'Plan', value: subscription.planKey },
      { key: 'subscription-status', label: 'Subscription status', value: subscription.status },
    ],
  };
}
