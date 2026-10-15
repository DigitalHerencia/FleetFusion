import { getMyAiUsage } from "@/lib/fetchers/aiFetchers";
import { AiUsageTemplate } from "@/components/templates/aiUsageTemplate";
export async function AiUsageFeature() {
  return <AiUsageTemplate usage={await getMyAiUsage()} />;
}
