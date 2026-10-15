import "server-only";

import { getHuggingFaceClient } from "./client";

export function generateHuggingFaceText(input: {
  model: string;
  prompt: string;
  maxTokens?: number;
}) {
  return getHuggingFaceClient().textGeneration({
    model: input.model,
    inputs: input.prompt,
    parameters: {
      max_new_tokens: input.maxTokens ?? 512,
      return_full_text: false,
    },
  });
}

export function getConfiguredHuggingFaceModel() {
  return (
    process.env.HUGGINGFACE_TEXT_MODEL?.trim() || "HuggingFaceH4/zephyr-7b-beta"
  );
}
