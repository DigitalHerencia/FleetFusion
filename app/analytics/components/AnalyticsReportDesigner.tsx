'use client';

import { useState, useTransition } from 'react';

import {
  createCustomReport,
  exportReportToPDF,
  scheduleReport,
  updateCustomReport,
} from '../lib/analyticsActions';
import { useReportDesigner } from '../lib/analyticsHooks';
import { analyticsKpis, analyticsRanges, reportTemplates } from '../schemas/analytics.schema';

type InitialReport = {
  id?: string;
  name?: string;
  description?: string;
  template?: (typeof reportTemplates)[number];
  kpi?: (typeof analyticsKpis)[number];
  range?: (typeof analyticsRanges)[number];
};

const titles: Record<(typeof analyticsKpis)[number], string> = {
  activity_events: 'Activity events',
  live: 'Live events',
  dashboard_views: 'Dashboard views',
  reports_run: 'Reports run',
  exports_run: 'Exports',
  active_vehicles: 'Active vehicles',
  active_drivers: 'Active drivers',
  active_loads: 'Open loads',
  delivered_loads: 'Delivered loads',
  expiring_documents: 'Expiring documents',
  on_time_rate: 'On-time delivery rate',
};

export function AnalyticsReportDesigner({
  initial,
  allowExport = false,
  allowRun = false,
  viewOnly = false,
}: {
  initial?: InitialReport;
  allowExport?: boolean;
  allowRun?: boolean;
  viewOnly?: boolean;
}) {
  const designer = useReportDesigner(initial);
  const [exportPending, startExport] = useTransition();
  const [exportError, setExportError] = useState('');
  const [runPending, startRun] = useTransition();
  const [runError, setRunError] = useState('');
  const [runResult, setRunResult] = useState<Awaited<ReturnType<typeof scheduleReport>> | null>(
    null,
  );
  const action = initial?.id ? updateCustomReport : createCustomReport;
  const submitAction = async (formData: FormData) => {
    await action(formData);
  };

  function downloadPdf() {
    if (!initial?.id) return;
    setExportError('');
    startExport(async () => {
      try {
        const file = await exportReportToPDF({ reportId: initial.id });
        const bytes = Uint8Array.from(atob(file.data), (character) => character.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: file.contentType }));
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = file.fileName;
        anchor.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        setExportError(error instanceof Error ? error.message : 'Could not export this report.');
      }
    });
  }

  function runSavedReport() {
    if (!initial?.id) return;
    setRunError('');
    startRun(async () => {
      try {
        setRunResult(await scheduleReport({ reportId: initial.id }));
      } catch (error) {
        setRunError(error instanceof Error ? error.message : 'Could not run this report.');
      }
    });
  }

  return (
    <section className="bg-card space-y-5 rounded-lg border p-5">
      {!viewOnly && (
        <form action={submitAction} className="grid gap-4 md:grid-cols-2">
          {initial?.id && <input name="id" type="hidden" value={initial.id} />}
          <label className="grid gap-1 text-sm md:col-span-2">
            Report name
            <input
              className="rounded-md border px-3 py-2"
              maxLength={120}
              name="name"
              onChange={(event) => designer.setName(event.target.value)}
              required
              value={designer.name}
            />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            Description
            <textarea
              className="min-h-20 rounded-md border px-3 py-2"
              maxLength={1000}
              name="description"
              onChange={(event) => designer.setDescription(event.target.value)}
              value={designer.description}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Visualization
            <select
              className="bg-background rounded-md border px-3 py-2"
              name="template"
              onChange={(event) =>
                designer.setTemplate(event.target.value as (typeof reportTemplates)[number])
              }
              value={designer.template}
            >
              {reportTemplates.map((template) => (
                <option key={template} value={template}>
                  {template.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Metric
            <select
              className="bg-background rounded-md border px-3 py-2"
              name="kpi"
              onChange={(event) =>
                designer.setKpi(event.target.value as (typeof analyticsKpis)[number])
              }
              value={designer.query.kpi}
            >
              {analyticsKpis.map((kpi) => (
                <option key={kpi} value={kpi}>
                  {titles[kpi]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Time range
            <select
              className="bg-background rounded-md border px-3 py-2"
              name="range"
              onChange={(event) =>
                designer.setRange(event.target.value as (typeof analyticsRanges)[number])
              }
              value={designer.query.range}
            >
              {analyticsRanges.map((range) => (
                <option key={range} value={range}>
                  {range.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Event context filter (optional)
            <input
              className="rounded-md border px-3 py-2"
              onChange={(event) => designer.setFilter('context', event.target.value || undefined)}
              value={String(designer.query.filters?.['context'] ?? '')}
            />
          </label>
          <input name="config" type="hidden" value={JSON.stringify(designer.query.filters ?? {})} />
          <button
            className="bg-primary text-primary-foreground w-fit rounded-md px-4 py-2"
            type="submit"
          >
            {initial?.id ? 'Save report' : 'Create report'}
          </button>
        </form>
      )}
      {(allowExport || allowRun) && (
        <div className="border-t pt-4">
          <div className="flex flex-wrap gap-3">
            {allowRun && (
              <button
                className="rounded-md border px-4 py-2 text-sm font-medium"
                disabled={runPending}
                onClick={runSavedReport}
                type="button"
              >
                {runPending ? 'Running…' : 'Run report now'}
              </button>
            )}
            {allowExport && (
              <button
                className="rounded-md border px-4 py-2 text-sm font-medium"
                disabled={exportPending}
                onClick={downloadPdf}
                type="button"
              >
                {exportPending ? 'Preparing PDF…' : 'Export PDF'}
              </button>
            )}
          </div>
          {exportError && (
            <p className="text-destructive mt-2 text-sm" role="alert">
              {exportError}
            </p>
          )}
          {runError && (
            <p className="text-destructive mt-2 text-sm" role="alert">
              {runError}
            </p>
          )}
          {runResult && (
            <pre className="bg-muted mt-3 max-h-64 overflow-auto rounded-md p-3 text-xs">
              {JSON.stringify(runResult.result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </section>
  );
}
