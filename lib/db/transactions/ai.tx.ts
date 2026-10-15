import type { Prisma } from "@/generated/prisma/client";

export async function lockAiRateLimitTx(
  tx: Prisma.TransactionClient,
  lockKey: string,
) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
}

export async function countRecentAiGenerationsTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    userId: string;
    windowStart: Date;
  },
) {
  return tx.aiGeneration.count({
    where: {
      organizationId: input.organizationId,
      userId: input.userId,
      createdAt: { gte: input.windowStart },
    },
  });
}

export async function startAiGenerationTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    userId: string;
    provider: string;
    model: string;
    prompt: string;
    requestHash: string;
  },
) {
  return tx.aiGeneration.create({
    data: {
      organizationId: input.organizationId,
      userId: input.userId,
      provider: input.provider,
      model: input.model,
      status: "RUNNING",
      input: { prompt: input.prompt },
      requestHash: input.requestHash,
      startedAt: new Date(),
    },
    select: { id: true },
  });
}

export async function failAiGenerationTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    generationId: string;
    errorCode: string;
  },
) {
  return tx.aiGeneration.updateMany({
    where: {
      id: input.generationId,
      organizationId: input.organizationId,
      status: { in: ["PENDING", "RUNNING"] },
    },
    data: {
      status: "FAILED",
      errorCode: input.errorCode.slice(0, 255),
      completedAt: new Date(),
    },
  });
}

export async function reconcileAiUsageBillingTx(
  tx: Prisma.TransactionClient,
  input: { organizationId: string },
) {
  const missing = await tx.aiGeneration.findMany({
    where: {
      organizationId: input.organizationId,
      status: "SUCCEEDED",
      usage: null,
    },
    select: {
      id: true,
      userId: true,
      provider: true,
      model: true,
      inputTokens: true,
      outputTokens: true,
      cost: true,
    },
  });
  for (const generation of missing) {
    await tx.aiUsageLedger.create({
      data: {
        organizationId: input.organizationId,
        generationId: generation.id,
        userId: generation.userId,
        provider: generation.provider,
        model: generation.model,
        inputTokens: generation.inputTokens,
        outputTokens: generation.outputTokens,
        cost: generation.cost,
      },
    });
  }
  return {
    reconciledGenerationIds: missing.map((generation) => generation.id),
  };
}
