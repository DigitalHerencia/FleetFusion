import "server-only";

import type { Prisma } from "../../generated/prisma/client";

import { prisma } from "./client";

export function withProviderTransaction<T>(
  work: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  return prisma.$transaction(work, { maxWait: 5_000, timeout: 15_000 });
}

export function withProviderOrganizationTransaction<T>(
  organizationId: string,
  work: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  return withProviderTransaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.organization_id', ${organizationId}, true)`;
    return work(tx);
  });
}
