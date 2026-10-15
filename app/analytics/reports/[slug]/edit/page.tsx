import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AnalyticsReportDesigner } from '../../../components/AnalyticsReportDesigner';
import { getReportById } from '../../../lib/analyticsFetchers';
import { analyticsKpis, analyticsRanges, reportTemplates } from '../../../schemas/analytics.schema';

export default async function EditAnalyticsReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = await getReportById(slug);
  if (!report) notFound();
  const definition = report.query.definition as Record<string, unknown>;
  const config = report.config as Record<string, unknown>;
  const kpi = analyticsKpis.find((value) => value === definition['kpi']) ?? 'activity_events';
  const range = analyticsRanges.find((value) => value === definition['range']) ?? 'last_30d';
  const template = reportTemplates.find((value) => value === config['template']) ?? 'kpi';
  return (
    <section className="space-y-5">
      <header>
        <Link className="text-primary text-sm underline" href={`/analytics/reports/${report.id}`}>
          ← Back to report
        </Link>
        <h1 className="mt-3 text-3xl font-bold">Edit report</h1>
        <p className="text-muted-foreground mt-2">
          Changes are saved to this organization’s report.
        </p>
      </header>
      <AnalyticsReportDesigner
        initial={{
          id: report.id,
          name: report.name,
          description: report.description ?? '',
          template,
          kpi,
          range,
        }}
      />
    </section>
  );
}
