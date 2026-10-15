import { SettingsHeader } from '../components/SettingsHeader';
import { SubscriptionPanel } from '../components/SubscriptionPanel';
import { getSubscriptionInfo } from '../lib/settingsFetchers';

export default async function BillingSettingsPage() {
  const subscription = await getSubscriptionInfo();
  return (
    <section className="grid gap-5">
      <SettingsHeader
        title="Subscription"
        description="Review the plan and subscription state associated with this organization."
      />
      <SubscriptionPanel subscription={subscription} />
    </section>
  );
}
