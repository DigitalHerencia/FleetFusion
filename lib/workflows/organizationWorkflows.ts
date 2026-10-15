import { getCurrentOrganization } from "@/lib/fetchers/organizationFetchers";
import { getIntegrationStatuses } from "@/lib/fetchers/integrationFetchers";

export async function getOrganizationWorkspaceWorkflow() {
  return getCurrentOrganization();
}

export async function getOrganizationSettingsWorkflow() {
  const [organization, integrations] = await Promise.all([
    getCurrentOrganization(),
    getIntegrationStatuses(),
  ]);
  return { organization, integrations };
}
