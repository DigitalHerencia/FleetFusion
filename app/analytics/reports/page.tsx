import { AnalyticsReportDesigner } from '../components/AnalyticsReportDesigner';
import { AnalyticsReportsTable } from '../components/AnalyticsReportsTable';
import { getAllReports } from '../lib/analyticsFetchers';

export default async function AnalyticsReportsPage() {
  const reports = await getAllReports();
  return (
    <section className="space-y-7">
      <header>
        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Analytics
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Custom reports</h1>
        <p className="text-muted-foreground mt-2">
          Build tenant-scoped reports from operational metrics and analytics events.
        </p>
      </header>
      <AnalyticsReportDesigner />
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Saved reports</h2>
        <AnalyticsReportsTable reports={reports} />
      </section>
    </section>
  );
}
