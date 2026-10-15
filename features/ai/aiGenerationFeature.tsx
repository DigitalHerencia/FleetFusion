import { getMyAiGenerations } from "@/lib/fetchers/aiFetchers";
import { AiGenerationTemplate } from "@/components/templates/aiGenerationTemplate";
export async function AiGenerationFeature() {
  return <AiGenerationTemplate generations={await getMyAiGenerations()} />;
}
