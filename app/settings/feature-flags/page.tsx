import { FeatureFlagsTable } from '../components/FeatureFlagsTable';
import { SettingsHeader } from '../components/SettingsHeader';
import { getFeatureFlags } from '../lib/settingsFetchers';

export default async function FeatureFlagsSettingsPage() {
  const { flags, planKey } = await getFeatureFlags();
  return (
    <section className="grid gap-5">
      <SettingsHeader
        title="Feature flags"
        description={`Organization overrides and plan entitlements for ${planKey}.`}
      />
      <FeatureFlagsTable flags={flags} />
    </section>
  );
}
