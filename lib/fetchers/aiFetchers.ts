import "server-only";

import { Prisma } from "../../generated/prisma/client";

import { assertPermission } from "../authz/permissions";
import { toAiGenerationDTO, toAiUsageSummaryDTO } from "../db/dto/ai.dto";
import { aiGenerationSelect } from "../db/selects/ai.selects";
import { withAuthenticatedRead } from "../db/tenant";
import { isHuggingFaceConfigured } from "../integrations/hugging-face/client";
import { getConfiguredHuggingFaceModel } from "../integrations/hugging-face/inference";

export async function getAiPlaygroundConfiguration() {
  return withAuthenticatedRead(async (_tx, access) => {
    assertPermission(access, "ai:read");
    return {
      configured: isHuggingFaceConfigured(),
      model: getConfiguredHuggingFaceModel(),
    };
  });
}

export async function getMyAiGenerations(limit = 50) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "ai:read");

    const rows = await tx.aiGeneration.findMany({
      where: {
        organizationId: access.organizationId,
        userId: access.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: Math.min(Math.max(limit, 1), 100),
      select: { ...aiGenerationSelect, input: true, output: true },
    });

    return rows.map((row) => ({
      ...toAiGenerationDTO(row),
      prompt:
        row.input &&
        typeof row.input === "object" &&
        "prompt" in row.input &&
        typeof row.input.prompt === "string"
          ? row.input.prompt
          : null,
      response:
        row.output &&
        typeof row.output === "object" &&
        "text" in row.output &&
        typeof row.output.text === "string"
          ? row.output.text
          : null,
    }));
  });
}

export async function getMyAiUsage() {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "ai:read");

    const aggregate = await tx.aiUsageLedger.aggregate({
      where: {
        organizationId: access.organizationId,
        userId: access.userId,
      },
      _sum: {
        inputTokens: true,
        outputTokens: true,
        cost: true,
      },
      _count: {
        _all: true,
      },
    });

    return toAiUsageSummaryDTO({
      inputTokens: aggregate._sum.inputTokens ?? 0,
      outputTokens: aggregate._sum.outputTokens ?? 0,
      cost: aggregate._sum.cost?.toString() ?? new Prisma.Decimal(0).toString(),
      generationCount: aggregate._count._all,
    });
  });
}
