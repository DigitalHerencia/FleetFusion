"use server";

import {
  completeAiGenerationSchema,
  createAiGenerationSchema,
  failAiGenerationSchema,
} from "@/schemas/aiSchemas";
import { requireIdentity } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/authz/permissions";
import { toAiGenerationDTO } from "@/lib/db/dto/ai.dto";
import { aiGenerationSelect } from "@/lib/db/selects/ai.selects";
import { withTenantTransaction } from "@/lib/db/tenant";
import { completeAiGenerationTx } from "@/lib/db/transactions/complete-ai-generation.tx";
import {
  failAiGenerationTx,
  lockAiRateLimitTx,
} from "@/lib/db/transactions/ai.tx";

class AiRateLimitError extends Error {
  constructor(message = "AI generation rate limit exceeded.") {
    super(message);
    this.name = "AiRateLimitError";
  }
}

async function createGeneration(
  rawInput: unknown,
  rateLimit?: { limit: number; windowStart: Date },
) {
  const input = createAiGenerationSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "ai:write");

    if (rateLimit) {
      if (!Number.isInteger(rateLimit.limit) || rateLimit.limit < 1) {
        throw new Error("The AI rate limit must be a positive integer.");
      }
      const lockKey = `ai-rate-limit:${access.userId}`;
      await lockAiRateLimitTx(tx, lockKey);
      const recentGenerationCount = await tx.aiGeneration.count({
        where: {
          organizationId: access.organizationId,
          userId: access.userId,
          createdAt: { gte: rateLimit.windowStart },
        },
      });
      if (recentGenerationCount >= rateLimit.limit) {
        throw new AiRateLimitError();
      }
    }

    const record = await tx.aiGeneration.create({
      data: {
        organizationId: access.organizationId,
        userId: access.userId,
        provider: input.provider,
        model: input.model,
        status: "PENDING",
        input: input.input,
        requestHash: input.requestHash ?? null,
      },
      select: aiGenerationSelect,
    });
    return toAiGenerationDTO(record);
  });
}

export async function createAiGenerationRecord(rawInput: unknown) {
  return createGeneration(rawInput);
}

export async function createRateLimitedAiGenerationRecord(
  rawInput: unknown,
  limit = 5,
  windowStart = new Date(Date.now() - 60_000),
) {
  return createGeneration(rawInput, { limit, windowStart });
}

/** Provider network I/O must complete before this database transaction begins. */
export async function completeAiGenerationRecord(rawInput: unknown) {
  const input = completeAiGenerationSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "ai:write");
    const record = await completeAiGenerationTx(tx, {
      organizationId: access.organizationId,
      generationId: input.generationId,
      output: input.output,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      cost: input.cost,
    });
    return toAiGenerationDTO(record);
  });
}

export async function failAiGenerationRecord(rawInput: unknown) {
  const input = failAiGenerationSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "ai:write");
    return failAiGenerationTx(tx, {
      organizationId: access.organizationId,
      generationId: input.generationId,
      errorCode: input.errorCode,
    });
  });
}
