import { getAdminMemberships } from "@/lib/fetchers/adminFetchers";
import { AdminUsersFeatureClient } from "./adminUsersFeature.client";
export async function AdminUsersFeature() {
  return <AdminUsersFeatureClient memberships={await getAdminMemberships()} />;
}
