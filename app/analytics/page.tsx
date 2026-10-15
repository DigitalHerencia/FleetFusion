import { AnalyticsChartRenderer } from './components/AnalyticsChartRenderer';
import { AnalyticsDashboardCards } from './components/AnalyticsDashboardCards';
import { AnalyticsFilters } from './components/AnalyticsFilters';
import { AnalyticsLiveActivity } from './components/AnalyticsLiveActivity';
import { AnalyticsTableRenderer } from './components/AnalyticsTableRenderer';
import { getDashboardMetrics } from './lib/analyticsFetchers';
import { analyticsRanges } from './schemas/analytics.schema';

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range = analyticsRanges.find((value) => value === params.range) ?? 'last_30d';
  const snapshot = await getDashboardMetrics({ range });
  return (
    <section className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Operations insights
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Analytics dashboard</h1>
        </div>
        <AnalyticsFilters range={range} />
      </header>
      <AnalyticsLiveActivity />
      <AnalyticsDashboardCards kpis={snapshot.kpis} />
      <AnalyticsChartRenderer data={snapshot.charts} title="Recorded activity by day" />
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Recent activity</h2>
        <AnalyticsTableRenderer
          emptyMessage="No analytics events have been recorded in this period."
          rows={snapshot.recentActivity.map((event) => ({
            id: event.id,
            type: event.eventType,
            occurredAt: event.occurredAt,
          }))}
        />
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Recently updated reports</h2>
        <AnalyticsTableRenderer
          rows={snapshot.recentReports.map((report) => ({
            id: report.id,
            name: report.name,
            updatedAt: report.updatedAt,
          }))}
        />
      </section>
    </section>
  );
}
