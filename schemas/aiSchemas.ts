import { z } from "zod";

export const aiGenerationRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(100_000),
});

export const createAiGenerationSchema = z.object({
  provider: z.string().trim().min(1).max(100),
  model: z.string().trim().min(1).max(200),
  input: z.record(z.string(), z.json()),
  requestHash: z.string().max(255).nullable().optional(),
});

export const completeAiGenerationSchema = z.object({
  generationId: z.string().uuid(),
  output: z.record(z.string(), z.json()),
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  cost: z.string().regex(/^\d+(\.\d{1,8})?$/),
});

export const failAiGenerationSchema = z.object({
  generationId: z.string().uuid(),
  errorCode: z.string().trim().min(1).max(255),
});
