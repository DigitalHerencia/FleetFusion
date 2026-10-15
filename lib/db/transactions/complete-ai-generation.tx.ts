import { Prisma } from "../../../generated/prisma/client";

import { aiGenerationSelect } from "../selects/ai.selects";
import { ConcurrencyConflictError, ResourceNotFoundError } from "./errors";

export async function completeAiGenerationTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    generationId: string;
    output: Prisma.InputJsonValue;
    inputTokens: number;
    outputTokens: number;
    cost: string;
  },
) {
  const generation = await tx.aiGeneration.findFirst({
    where: {
      id: input.generationId,
      organizationId: input.organizationId,
    },
    select: {
      id: true,
      userId: true,
      provider: true,
      model: true,
      status: true,
    },
  });

  if (!generation) {
    throw new ResourceNotFoundError("AI generation");
  }

  if (
    generation.status === "SUCCEEDED" ||
    generation.status === "FAILED" ||
    generation.status === "CANCELED"
  ) {
    throw new ConcurrencyConflictError("AI generation");
  }

  const cost = new Prisma.Decimal(input.cost);

  const updated = await tx.aiGeneration.update({
    where: {
      id: generation.id,
    },
    data: {
      status: "SUCCEEDED",
      output: input.output,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      cost,
      completedAt: new Date(),
    },
    select: aiGenerationSelect,
  });

  await tx.aiUsageLedger.create({
    data: {
      organizationId: input.organizationId,
      userId: generation.userId,
      generationId: generation.id,
      provider: generation.provider,
      model: generation.model,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      cost,
    },
  });

  return updated;
}
