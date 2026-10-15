import { getPortalBilling } from "@/lib/fetchers/portalFetchers";
import { PortalBillingTemplate } from "@/components/templates/portalBillingTemplate";
export async function BillingFeature() {
  return <PortalBillingTemplate billing={await getPortalBilling()} />;
}
