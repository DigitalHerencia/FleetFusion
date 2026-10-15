import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import type {
  AccessContext,
  AppRole,
  AuthenticatedIdentity,
} from "@/types/access";

import { requireIdentity } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/client";

export class TenantContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantContextError";
  }
}

async function resolveAccessContext(
  tx: Prisma.TransactionClient,
  identity: AuthenticatedIdentity,
): Promise<AccessContext> {
  await tx.$queryRaw`
    SELECT set_config('app.clerk_user_id', ${identity.clerkUserId}, true)
  `;

  const user = await tx.user.findUnique({
    where: { clerkUserId: identity.clerkUserId },
    select: { id: true },
  });
  if (!user) {
    throw new TenantContextError(
      "The authenticated Clerk user is not provisioned in the application database.",
    );
  }

  const membership = await tx.membership.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true, organizationId: true, role: true },
  });
  if (!membership) {
    throw new TenantContextError(
      "The authenticated user does not have an active application membership.",
    );
  }

  await tx.$queryRaw`
    SELECT set_config('app.organization_id', ${membership.organizationId}, true)
  `;

  return {
    clerkUserId: identity.clerkUserId,
    organizationId: membership.organizationId,
    membershipId: membership.id,
    userId: user.id,
    role: membership.role as AppRole,
  };
}

export async function withTenantTransaction<T>(
  identity: AuthenticatedIdentity,
  work: (tx: Prisma.TransactionClient, access: AccessContext) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(
    async (tx) => work(tx, await resolveAccessContext(tx, identity)),
    { maxWait: 5_000, timeout: 15_000 },
  );
}

export async function withAuthenticatedRead<T>(
  read: (tx: Prisma.TransactionClient, access: AccessContext) => Promise<T>,
): Promise<T> {
  return withTenantTransaction(await requireIdentity(), read);
}
