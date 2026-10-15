import "server-only";

import { getHuggingFaceClient } from "./client";

export function createHuggingFaceEmbedding(input: {
  model: string;
  text: string;
}) {
  return getHuggingFaceClient().featureExtraction({
    model: input.model,
    inputs: input.text,
  });
}
