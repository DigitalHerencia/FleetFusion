import Link from 'next/link';

import { deleteCustomReport } from '../lib/analyticsActions';
import type { getAllReports } from '../lib/analyticsFetchers';

type Report = Awaited<ReturnType<typeof getAllReports>>[number];

async function removeReport(formData: FormData) {
  'use server';
  await deleteCustomReport(formData);
}

export function AnalyticsReportsTable({ reports }: { reports: Report[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-3">Report</th>
            <th className="p-3">Metric</th>
            <th className="p-3">Visualization</th>
            <th className="p-3">Updated</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => {
            const definition = report.query.definition as { kpi?: string; template?: string };
            const config = report.config as { template?: string };
            return (
              <tr className="border-t" key={report.id}>
                <td className="p-3">
                  <Link
                    className="text-primary font-medium underline-offset-4 hover:underline"
                    href={`/analytics/reports/${report.id}`}
                  >
                    {report.name}
                  </Link>
                  {report.description && (
                    <p className="text-muted-foreground mt-1 max-w-md text-xs">
                      {report.description}
                    </p>
                  )}
                </td>
                <td className="p-3">{definition.kpi?.replaceAll('_', ' ') ?? '—'}</td>
                <td className="p-3">{config.template ?? definition.template ?? 'KPI'}</td>
                <td className="p-3 whitespace-nowrap">{report.updatedAt.toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex items-center gap-3 whitespace-nowrap">
                    <Link href={`/analytics/reports/${report.id}/edit`}>Edit</Link>
                    <form action={removeReport}>
                      <input name="id" type="hidden" value={report.id} />
                      <button className="text-destructive underline" type="submit">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
          {!reports.length && (
            <tr>
              <td className="text-muted-foreground p-6 text-center" colSpan={5}>
                No reports have been created for this organization.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
