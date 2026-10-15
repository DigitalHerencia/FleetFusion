import { getCurrentOrganization } from "@/lib/fetchers/organizationFetchers";
import { SharedProfileSettingsTemplate } from "@/components/templates/sharedProfileSettingsTemplate";
import { ProfileFeatureClient } from "./profileFeature.client";
export async function ProfileFeature() {
  const organization = await getCurrentOrganization();
  return (
    <SharedProfileSettingsTemplate organization={organization}>
      <ProfileFeatureClient organization={organization} />
    </SharedProfileSettingsTemplate>
  );
}
