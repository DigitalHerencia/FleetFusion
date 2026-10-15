import { getPortalBilling } from "@/lib/fetchers/portalFetchers";
import { SharedBillingSettingsTemplate } from "@/components/templates/sharedBillingSettingsTemplate";
export async function BillingFeature() {
  return <SharedBillingSettingsTemplate billing={await getPortalBilling()} />;
}
