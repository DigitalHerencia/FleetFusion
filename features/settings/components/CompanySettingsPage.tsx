import { getCompanyProfile } from '@/lib/fetchers/settingsFetchers';
import { CompanyProfileForm } from '@/components/settings/CompanyProfileForm';
import { updateCompanyProfileAction } from '@/lib/actions/settingsActions';

export default async function CompanySettingsPage({
  orgId,
}: {
  orgId: string;
}) {
  const profile = await getCompanyProfile(orgId);
  // ...render form and handle submit with server action...
  return <CompanyProfileForm profile={profile} onSubmit={() => {}} />;
}
