import Link from 'next/link';

import type { DashboardTab } from '../lib/dashboardHooks';

const tabs: Array<{ id: DashboardTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'operations', label: 'Operations' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'financials', label: 'Financials' },
];

export function DashboardTabs({ activeTab = 'overview' }: { activeTab?: DashboardTab }) {
  return (
    <nav className="dashboard-tabs" aria-label="Dashboard sections">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={`/dashboard?tab=${tab.id}`}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export default DashboardTabs;
