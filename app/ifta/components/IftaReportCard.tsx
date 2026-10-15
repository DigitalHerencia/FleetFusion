import Link from 'next/link';

import type { IftaJurisdictionSummary, IftaReport } from '../types';

interface IftaReportCardProps {
  report?: IftaReport | null;
  draftRows?: IftaJurisdictionSummary[];
  totalMiles?: number;
  totalGallons?: number;
}

function summaryOf(report?: IftaReport | null) {
  const summary = report?.summary;
  if (!summary || typeof summary !== 'object') return null;
  return summary as {
    jurisdictions?: IftaJurisdictionSummary[];
    rows?: IftaJurisdictionSummary[];
    totalMiles?: number;
    totalGallons?: number;
    totalTaxDue?: number;
  };
}

function quarterLabel(year: number, quarter: number) {
  return `Q${quarter} ${year}`;
}

export function IftaReportCard({
  report,
  draftRows = [],
  totalMiles,
  totalGallons,
}: IftaReportCardProps) {
  const summary = summaryOf(report);
  const rows = summary?.jurisdictions ?? summary?.rows ?? draftRows;

  return (
    <section className="rounded-lg border">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b p-5">
        <div>
          <h2 className="text-lg font-semibold">
            {report
              ? `${quarterLabel(report.year, report.quarter)} IFTA report`
              : 'Quarterly report preview'}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {report
              ? `Status: ${report.status.toLowerCase()}`
              : 'Review the mileage, fuel, and tax data before filing.'}
          </p>
        </div>
        <Link className="text-sm font-medium underline" href="/ifta/trips">
          Review trip records
        </Link>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-3">
        <div className="bg-muted/40 rounded-md p-3">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">Jurisdictions</p>
          <p className="mt-1 text-xl font-semibold">{rows.length}</p>
        </div>
        <div className="bg-muted/40 rounded-md p-3">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">Reported miles</p>
          <p className="mt-1 text-xl font-semibold">
            {(summary?.totalMiles ?? totalMiles)?.toLocaleString() ?? '—'}
          </p>
        </div>
        <div className="bg-muted/40 rounded-md p-3">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">Purchased gallons</p>
          <p className="mt-1 text-xl font-semibold">
            {(summary?.totalGallons ?? totalGallons)?.toLocaleString() ?? '—'}
          </p>
        </div>
      </div>
      {rows.length > 0 ? (
        <div className="overflow-x-auto border-t">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Jurisdiction</th>
                <th className="px-5 py-3 text-right font-medium">Miles traveled</th>
                <th className="px-5 py-3 text-right font-medium">Fuel purchased (gal)</th>
                <th className="px-5 py-3 text-right font-medium">Taxable gallons</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.jurisdiction}>
                  <td className="px-5 py-3 font-medium">{row.jurisdiction}</td>
                  <td className="px-5 py-3 text-right">{row.miles.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">{row.gallons.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    {row.taxableGallons?.toLocaleString() ?? 'Not calculated'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted-foreground border-t px-5 py-6 text-sm">
          No trip and fuel data is available for the selected period yet.
        </p>
      )}
      <p className="text-muted-foreground border-t px-5 py-3 text-xs">
        Fuel tax due requires the appropriate rate and taxable gallons, which depend on fleet
        consumption, not simply fuel purchased. Verify those values against your records and
        official jurisdiction rates before submitting a return.
      </p>
    </section>
  );
}
