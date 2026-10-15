import { DashboardFilters } from './components/DashboardFilters';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardKPIs } from './components/DashboardKPIs';
import { DashboardMobile } from './components/DashboardMobile';
import { DashboardNotificationsPanel } from './components/DashboardNotificationsPanel';
import { DashboardQuickActions } from './components/DashboardQuickActions';
import { DashboardRealtimeStatus } from './components/DashboardRealtimeStatus';
import { DashboardTabs } from './components/DashboardTabs';
import {
  getComplianceSnapshot,
  getDriverActivitySummary,
  getFleetOverview,
  getIftaSummary,
  getNotificationDigest,
  getRecentEvents,
} from './lib/dashboardFetchers';
import type { DashboardTab } from './lib/dashboardHooks';

const tabs: DashboardTab[] = ['overview', 'operations', 'compliance', 'financials'];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; tab?: string }>;
}) {
  const query = await searchParams;
  const range = { from: query.from, to: query.to };
  const activeTab = tabs.includes(query.tab as DashboardTab)
    ? (query.tab as DashboardTab)
    : 'overview';
  const [overview, drivers, compliance, ifta, digest, events] = await Promise.all([
    getFleetOverview(range),
    getDriverActivitySummary(),
    getComplianceSnapshot(),
    getIftaSummary(range),
    getNotificationDigest(),
    getRecentEvents(),
  ]);
  return (
    <main className="domain-page">
      <DashboardHeader />
      <DashboardRealtimeStatus />
      <DashboardFilters from={query.from} to={query.to} />
      <DashboardTabs activeTab={activeTab} />
      <DashboardMobile overview={overview} />
      <DashboardKPIs overview={overview} />
      <div className="dashboard-grid">
        <DashboardQuickActions />
        <DashboardNotificationsPanel notifications={digest.notifications} />
      </div>
      {activeTab === 'operations' && (
        <section className="dashboard-panel">
          <h2>Driver activity</h2>
          <p>
            {drivers.active} active of {drivers.total} drivers; {drivers.onShift} currently on
            shift.
          </p>
        </section>
      )}
      {activeTab === 'compliance' && (
        <section className="dashboard-panel">
          <h2>Compliance snapshot</h2>
          <p>
            {compliance.expired.length} expired and {compliance.expiringSoon.length} expiring within
            90 days.
          </p>
          {compliance.documents.slice(0, 8).map((document) => (
            <p key={document.id}>
              {document.title} — {document.expirationDate?.toLocaleDateString() ?? 'No expiry date'}
            </p>
          ))}
        </section>
      )}
      {activeTab === 'financials' && (
        <section className="dashboard-panel">
          <h2>IFTA & financial summary</h2>
          <p>
            Q{ifta.quarter} {ifta.year} · {ifta.totalMiles.toLocaleString()} miles ·{' '}
            {ifta.totalGallons.toLocaleString()} gallons
          </p>
          <p>
            Estimated tax due:{' '}
            {(ifta.taxDueCents / 100).toLocaleString(undefined, {
              style: 'currency',
              currency: 'USD',
            })}
          </p>
        </section>
      )}
      <section className="dashboard-panel">
        <h2>Recent activity</h2>
        {events.map((event) => (
          <article key={event.id}>
            <p>
              {event.action} · {event.entityType}
              {event.entityId ? ` (${event.entityId})` : ''}
            </p>
            <time dateTime={event.createdAt.toISOString()}>{event.createdAt.toLocaleString()}</time>
          </article>
        ))}
        {!events.length && <p>No recent activity.</p>}
      </section>
    </main>
  );
}
