import type { Prisma } from "../../../generated/prisma/client";

export const auditEventSelect = {
  id: true,
  action: true,
  resourceType: true,
  resourceId: true,
  metadata: true,
  actor: {
    select: {
      id: true,
      displayName: true,
      email: true,
    },
  },
  createdAt: true,
} satisfies Prisma.AuditEventSelect;

export type AuditEventRecord = Prisma.AuditEventGetPayload<{
  select: typeof auditEventSelect;
}>;

export const adminMembershipSelect = {
  id: true,
  role: true,
  status: true,
  user: { select: { id: true, displayName: true, email: true } },
  createdAt: true,
} satisfies Prisma.MembershipSelect;

export type AdminMembershipRecord = Prisma.MembershipGetPayload<{
  select: typeof adminMembershipSelect;
}>;

export const adminProviderSubscriptionSelect = {
  id: true,
  organizationId: true,
  provider: true,
  providerCustomerId: true,
  providerSubscriptionId: true,
  planKey: true,
  status: true,
  currentPeriodEnd: true,
  cancelAtPeriodEnd: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BillingSubscriptionSelect;

export type AdminProviderSubscriptionRecord =
  Prisma.BillingSubscriptionGetPayload<{
    select: typeof adminProviderSubscriptionSelect;
  }>;
