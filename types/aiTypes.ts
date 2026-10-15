export interface AiGenerationDTO {
  id: string;
  provider: string;
  model: string;
  status: string;
  inputTokens: number;
  outputTokens: number;
  cost: string;
  errorCode: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}
export interface AiUsageSummaryDTO {
  inputTokens: number;
  outputTokens: number;
  cost: string;
  generationCount: number;
}
export interface AiGenerationHistoryDTO extends AiGenerationDTO {
  prompt: string | null;
  response: string | null;
}
export interface AiUsageItem {
  inputTokens: number;
  outputTokens: number;
  cost: string;
}

export interface ExecuteAiGenerationCommand {
  prompt: string;
}
