import { getPortalDocuments } from "@/lib/fetchers/portalFetchers";
import { PortalHomeTemplate } from "@/components/templates/portalHomeTemplate";
export async function PortalFeature() {
  return <PortalHomeTemplate documents={await getPortalDocuments()} />;
}
