import "server-only";

import { InferenceClient } from "@huggingface/inference";

let client: InferenceClient | undefined;

export function isHuggingFaceConfigured() {
  return Boolean(process.env.HUGGINGFACE_ACCESS_TOKEN?.trim());
}

export function getHuggingFaceClient() {
  const accessToken = process.env.HUGGINGFACE_ACCESS_TOKEN?.trim();
  if (!accessToken)
    throw new Error(
      "Hugging Face is not configured. Add HUGGINGFACE_ACCESS_TOKEN to .env.local.",
    );
  client ??= new InferenceClient(accessToken);
  return client;
}
