import type { PortalBillingDTO } from "@/types/portalTypes";
import { PortalBillingTemplate } from "./portalBillingTemplate";
export function SharedBillingSettingsTemplate({
  billing,
}: {
  billing: PortalBillingDTO;
}) {
  return <PortalBillingTemplate billing={billing} />;
}
