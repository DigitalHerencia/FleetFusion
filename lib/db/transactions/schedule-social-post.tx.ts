import type { Prisma } from "../../../generated/prisma/client";

import { socialPostSelect } from "../selects/social.selects";
import { ConcurrencyConflictError, InvariantViolationError } from "./errors";

export async function scheduleSocialPostTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    postId: string;
    scheduledAt: Date;
    expectedVersion: number;
  },
) {
  if (input.scheduledAt.getTime() <= Date.now()) {
    throw new InvariantViolationError(
      "A scheduled social post must have a future publication time.",
    );
  }

  const result = await tx.socialPost.updateMany({
    where: {
      id: input.postId,
      organizationId: input.organizationId,
      version: input.expectedVersion,
      status: {
        in: ["DRAFT", "FAILED"],
      },
      approvedAt: { not: null },
    },
    data: {
      status: "SCHEDULED",
      scheduledAt: input.scheduledAt,
      version: {
        increment: 1,
      },
    },
  });

  if (result.count !== 1) {
    throw new ConcurrencyConflictError("Social post");
  }

  await tx.socialVariant.updateMany({
    where: {
      organizationId: input.organizationId,
      postId: input.postId,
    },
    data: {
      status: "SCHEDULED",
    },
  });

  return tx.socialPost.findFirstOrThrow({
    where: {
      id: input.postId,
      organizationId: input.organizationId,
    },
    select: socialPostSelect,
  });
}
