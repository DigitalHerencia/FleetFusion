import { getCurrentOrganization } from "@/lib/fetchers/organizationFetchers";
import { SharedDashboardTemplate } from "@/components/templates/sharedDashboardTemplate";
export async function DashboardFeature() {
  return (
    <SharedDashboardTemplate organization={await getCurrentOrganization()} />
  );
}
