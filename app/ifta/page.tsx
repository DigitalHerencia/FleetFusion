import { IftaHeader } from './components/IftaHeader';
import { IftaMobile } from './components/IftaMobile';
import { IftaReportCard } from './components/IftaReportCard';
import { IftaReportCardOptimistic } from './components/IftaReportCardOptimistic';
import { getIftaReport, getJurisdictionMatrix, getReportDraft } from './lib/iftaFetchers';
import type { IftaJurisdictionSummary, IftaReport } from './types';

type ReportData = {
  year?: number;
  quarter?: number;
  status?: string;
  summary?: IftaReport['summary'];
  createdAt?: Date | string;
  id?: string;
  organizationId?: string;
  updatedAt?: Date | string;
};

function isReport(value: unknown): value is IftaReport {
  if (!value || typeof value !== 'object') return false;
  const report = value as ReportData;
  return (
    typeof report.year === 'number' &&
    typeof report.quarter === 'number' &&
    typeof report.status === 'string' &&
    Boolean(report.summary)
  );
}

function rowsFrom(data: unknown): IftaJurisdictionSummary[] {
  const value = data as { rows?: unknown; jurisdictions?: unknown } | null;
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(value?.rows)
      ? value.rows
      : Array.isArray(value?.jurisdictions)
        ? value.jurisdictions
        : [];
  return rows.filter(
    (row): row is IftaJurisdictionSummary =>
      Boolean(row) &&
      typeof row === 'object' &&
      typeof (row as IftaJurisdictionSummary).jurisdiction === 'string' &&
      typeof (row as IftaJurisdictionSummary).miles === 'number' &&
      typeof (row as IftaJurisdictionSummary).gallons === 'number',
  );
}

export default async function IftaPage() {
  const [latestReport, draft, matrix] = await Promise.all([
    getIftaReport(),
    getReportDraft(),
    getJurisdictionMatrix(),
  ]);
  const report = isReport(latestReport) ? latestReport : null;
  const draftData = draft as { rows?: unknown; totalMiles?: unknown; totalGallons?: unknown };
  const matrixData = matrix as { jurisdictions?: unknown };
  const rows = rowsFrom(matrixData);
  const previewRows = rows.length ? rows : rowsFrom(draftData);
  const totalMiles =
    typeof draftData?.totalMiles === 'number'
      ? draftData.totalMiles
      : previewRows.reduce((total, row) => total + row.miles, 0);
  const totalGallons =
    typeof draftData?.totalGallons === 'number'
      ? draftData.totalGallons
      : previewRows.reduce((total, row) => total + row.gallons, 0);

  return (
    <main className="space-y-6 p-6">
      <IftaMobile />
      <IftaHeader />
      <IftaReportCard
        draftRows={previewRows}
        report={report}
        totalGallons={totalGallons}
        totalMiles={totalMiles}
      />
      <IftaReportCardOptimistic />
      <section className="grid gap-4 sm:grid-cols-2">
        <Link className="hover:bg-muted/30 rounded-lg border p-5" href="/ifta/trips">
          <h2 className="font-semibold">Trip mileage</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Review vehicle miles and state or province breakdowns.
          </p>
        </Link>
        <Link className="hover:bg-muted/30 rounded-lg border p-5" href="/ifta/fuel">
          <h2 className="font-semibold">Fuel purchases</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Track gallons and purchase jurisdiction for each receipt.
          </p>
        </Link>
      </section>
    </main>
  );
}
import Link from 'next/link';
