import Link from 'next/link';

import { SettingsHeader } from './components/SettingsHeader';
import { getSettingsDashboardSnapshot } from './lib/settingsFetchers';

export default async function SettingsPage() {
  const snapshot = await getSettingsDashboardSnapshot();
  return (
    <section>
      <SettingsHeader
        title="Organization settings"
        description="Manage your organization, members, plan, and access controls."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {snapshot.cards.map((card) => (
          <article key={card.key} className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-xl font-semibold">{card.value}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/settings/organization"
          className="rounded-xl border bg-white p-5 hover:bg-slate-50"
        >
          <h2 className="font-semibold">Organization profile</h2>
          <p className="mt-1 text-sm text-slate-600">Edit company details and address.</p>
        </Link>
        <Link href="/settings/users" className="rounded-xl border bg-white p-5 hover:bg-slate-50">
          <h2 className="font-semibold">Members and roles</h2>
          <p className="mt-1 text-sm text-slate-600">Manage who can access this workspace.</p>
        </Link>
        <Link href="/settings/billing" className="rounded-xl border bg-white p-5 hover:bg-slate-50">
          <h2 className="font-semibold">Subscription</h2>
          <p className="mt-1 text-sm text-slate-600">Review your plan and included features.</p>
        </Link>
        <Link
          href="/settings/feature-flags"
          className="rounded-xl border bg-white p-5 hover:bg-slate-50"
        >
          <h2 className="font-semibold">Feature flags</h2>
          <p className="mt-1 text-sm text-slate-600">
            Configure organization-level feature access.
          </p>
        </Link>
      </div>
    </section>
  );
}
