import type {
  MembershipRole,
  MembershipStatus,
  Prisma,
  SubscriptionStatus,
} from "@/generated/prisma/client";

import {
  adminMembershipSelect,
  adminProviderSubscriptionSelect,
} from "../selects/admin.selects";
import { ResourceNotFoundError } from "./errors";

export async function updateMembershipAdministrationTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    actorUserId: string;
    membershipId: string;
    role?: MembershipRole;
    status?: MembershipStatus;
  },
) {
  const membership = await tx.membership.findFirst({
    where: {
      id: input.membershipId,
      organizationId: input.organizationId,
    },
    select: { id: true },
  });
  if (!membership) throw new ResourceNotFoundError("Membership");

  const updated = await tx.membership.update({
    where: { id: membership.id },
    data: {
      ...(input.role ? { role: input.role } : {}),
      ...(input.status ? { status: input.status } : {}),
    },
    select: adminMembershipSelect,
  });
  await tx.auditEvent.create({
    data: {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      action: "admin.membership.updated",
      resourceType: "Membership",
      resourceId: updated.id,
      metadata: { role: updated.role, status: updated.status },
    },
  });
  return updated;
}

export async function reconcileAdministrativeProviderStateTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    actorUserId: string;
    provider: string;
    providerCustomerId?: string | null;
    providerSubscriptionId?: string | null;
    planKey: string;
    status: SubscriptionStatus;
    currentPeriodEnd?: Date | null;
    cancelAtPeriodEnd: boolean;
  },
) {
  const subscription = await tx.billingSubscription.upsert({
    where: { organizationId: input.organizationId },
    create: {
      organizationId: input.organizationId,
      provider: input.provider,
      providerCustomerId: input.providerCustomerId ?? null,
      providerSubscriptionId: input.providerSubscriptionId ?? null,
      planKey: input.planKey,
      status: input.status,
      currentPeriodEnd: input.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd,
    },
    update: {
      provider: input.provider,
      providerCustomerId: input.providerCustomerId ?? null,
      providerSubscriptionId: input.providerSubscriptionId ?? null,
      planKey: input.planKey,
      status: input.status,
      currentPeriodEnd: input.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd,
    },
    select: adminProviderSubscriptionSelect,
  });
  await tx.auditEvent.create({
    data: {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      action: "admin.provider.reconciled",
      resourceType: "BillingSubscription",
      resourceId: subscription.id,
      metadata: {
        provider: subscription.provider,
        status: subscription.status,
      },
    },
  });
  return subscription;
}
