import type {
  AiGenerationDTO,
  AiUsageSummaryDTO,
} from "../../../types/aiTypes";
import type { AiGenerationRecord } from "../selects/ai.selects";

export function toAiGenerationDTO(record: AiGenerationRecord): AiGenerationDTO {
  return {
    id: record.id,
    provider: record.provider,
    model: record.model,
    status: record.status,
    inputTokens: record.inputTokens,
    outputTokens: record.outputTokens,
    cost: record.cost.toString(),
    errorCode: record.errorCode,
    startedAt: record.startedAt?.toISOString() ?? null,
    completedAt: record.completedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
  };
}

export function toAiUsageSummaryDTO(input: {
  inputTokens: number;
  outputTokens: number;
  cost: string;
  generationCount: number;
}): AiUsageSummaryDTO {
  return {
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    cost: input.cost,
    generationCount: input.generationCount,
  };
}
