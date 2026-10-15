import { getCrmDeals } from "@/lib/fetchers/crmFetchers";
import { CrmAnalyticsTemplate } from "@/components/templates/crmAnalyticsTemplate";
export async function CrmAnalyticsFeature() {
  return <CrmAnalyticsTemplate deals={await getCrmDeals(100)} />;
}
