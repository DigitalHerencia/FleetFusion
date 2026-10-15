import { Prisma } from "@/generated/prisma/client";

const idempotencySelect = {
  id: true,
  organizationId: true,
  scope: true,
  key: true,
  state: true,
  result: true,
  errorCode: true,
  completedAt: true,
} as const;

export async function claimIdempotencyTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId?: string | null;
    scope: string;
    key: string;
  },
) {
  const scope = input.organizationId
    ? `${input.organizationId}:${input.scope}`
    : input.scope;

  try {
    const record = await tx.idempotencyRecord.create({
      data: {
        organizationId: input.organizationId ?? null,
        scope,
        key: input.key,
        state: "STARTED",
      },
      select: idempotencySelect,
    });
    return { ...record, claimed: true as const };
  } catch (cause) {
    if (
      !(cause instanceof Prisma.PrismaClientKnownRequestError) ||
      cause.code !== "P2002"
    ) {
      throw cause;
    }

    const record = await tx.idempotencyRecord.findUniqueOrThrow({
      where: { scope_key: { scope, key: input.key } },
      select: idempotencySelect,
    });
    return { ...record, claimed: false as const };
  }
}

export async function completeIdempotencyTx(
  tx: Prisma.TransactionClient,
  input: {
    id: string;
    result?: Prisma.InputJsonValue;
  },
): Promise<void> {
  await tx.idempotencyRecord.update({
    where: { id: input.id },
    data: {
      state: "COMPLETED",
      ...(input.result === undefined ? {} : { result: input.result }),
      completedAt: new Date(),
      errorCode: null,
    },
  });
}
