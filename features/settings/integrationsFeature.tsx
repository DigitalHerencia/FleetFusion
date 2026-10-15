import { getIntegrationStatuses } from "@/lib/fetchers/integrationFetchers";
import { SharedIntegrationsTemplate } from "@/components/templates/sharedIntegrationsTemplate";
export async function IntegrationsFeature() {
  return (
    <SharedIntegrationsTemplate integrations={await getIntegrationStatuses()} />
  );
}
