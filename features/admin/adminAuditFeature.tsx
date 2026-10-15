import { getAuditEvents } from "@/lib/fetchers/adminFetchers";
import { AdminAuditFeatureClient } from "./adminAuditFeature.client";
export async function AdminAuditFeature() {
  return <AdminAuditFeatureClient events={await getAuditEvents()} />;
}
