import { OrganizationProfileForm } from '../components/OrganizationProfileForm';
import { SettingsHeader } from '../components/SettingsHeader';
import { getOrgProfile } from '../lib/settingsFetchers';

export default async function OrganizationSettingsPage() {
  const profile = await getOrgProfile();
  return (
    <section>
      <SettingsHeader
        title="Organization profile"
        description="Company details are scoped to your active organization."
      />
      <OrganizationProfileForm profile={profile} />
    </section>
  );
}
