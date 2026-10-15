import type { Prisma } from "../../../generated/prisma/client";

export const aiGenerationSelect = {
  id: true,
  provider: true,
  model: true,
  status: true,
  inputTokens: true,
  outputTokens: true,
  cost: true,
  errorCode: true,
  startedAt: true,
  completedAt: true,
  createdAt: true,
} satisfies Prisma.AiGenerationSelect;

export type AiGenerationRecord = Prisma.AiGenerationGetPayload<{
  select: typeof aiGenerationSelect;
}>;
