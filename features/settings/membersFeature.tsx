import { getOrganizationMembers } from "@/lib/fetchers/organizationFetchers";
import { SharedMembersTemplate } from "@/components/templates/sharedMembersTemplate";
export async function MembersFeature() {
  return <SharedMembersTemplate members={await getOrganizationMembers()} />;
}
