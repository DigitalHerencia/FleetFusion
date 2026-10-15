import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AnalyticsDashboardCards } from '../../components/AnalyticsDashboardCards';
import { AnalyticsReportDesigner } from '../../components/AnalyticsReportDesigner';
import { AnalyticsTableRenderer } from '../../components/AnalyticsTableRenderer';
import { getReportById, runQuery } from '../../lib/analyticsFetchers';
import { analyticsKpis, analyticsRanges } from '../../schemas/analytics.schema';

export default async function AnalyticsReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = await getReportById(slug);
  if (!report) notFound();

  const definition = report.query.definition as Record<string, unknown>;
  const kpi = analyticsKpis.find((value) => value === definition['kpi']) ?? 'activity_events';
  const range = analyticsRanges.find((value) => value === definition['range']) ?? 'last_30d';
  const result = await runQuery({ kpi, range, filters: definition['filters'] ?? {} });
  const metric = [
    {
      id: kpi,
      label: kpi.replaceAll('_', ' '),
      value: result.value,
      format: kpi === 'on_time_rate' ? 'percent' : 'number',
    },
  ];

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link className="text-primary text-sm underline" href="/analytics/reports">
            ← All reports
          </Link>
          <h1 className="mt-3 text-3xl font-bold">{report.name}</h1>
          <p className="text-muted-foreground mt-2">
            {report.description || 'Saved organization report'}
          </p>
        </div>
        <Link
          className="rounded-md border px-4 py-2 text-sm"
          href={`/analytics/reports/${report.id}/edit`}
        >
          Edit report
        </Link>
      </header>
      <AnalyticsDashboardCards kpis={metric} />
      <p className="text-muted-foreground text-sm">
        Metric range: {range.replaceAll('_', ' ')} · Updated {report.updatedAt.toLocaleString()}
      </p>
      <AnalyticsTableRenderer
        emptyMessage="No matching events were recorded."
        rows={result.rows.map((event) => ({
          id: event.id,
          event: event.eventType,
          context: event.context,
          occurredAt: event.occurredAt,
        }))}
      />
      <AnalyticsReportDesigner
        initial={{
          id: report.id,
          name: report.name,
          description: report.description ?? '',
          kpi,
          range,
        }}
        allowExport
        allowRun
        viewOnly
      />
    </section>
  );
}
