import { getAiPlaygroundConfiguration } from "@/lib/fetchers/aiFetchers";
import { AiPlaygroundFeatureClient } from "./aiPlaygroundFeature.client";
export async function AiPlaygroundFeature() {
  return (
    <AiPlaygroundFeatureClient
      configuration={await getAiPlaygroundConfiguration()}
    />
  );
}
