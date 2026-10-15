import { analyticsRanges } from '../schemas/analytics.schema';

const labels: Record<(typeof analyticsRanges)[number], string> = {
  last_7d: 'Last 7 days',
  last_30d: 'Last 30 days',
  last_90d: 'Last 90 days',
  this_year: 'This year',
  all: 'All time',
  realtime: 'Last 5 minutes',
};

export function AnalyticsFilters({ range }: { range: (typeof analyticsRanges)[number] }) {
  return (
    <form action="/analytics" className="flex flex-wrap items-end gap-3" method="get">
      <label className="grid gap-1 text-sm">
        Reporting period
        <select
          className="bg-background min-w-40 rounded-md border px-3 py-2"
          defaultValue={range}
          name="range"
        >
          {analyticsRanges.map((value) => (
            <option key={value} value={value}>
              {labels[value]}
            </option>
          ))}
        </select>
      </label>
      <button
        className="hover:bg-muted rounded-md border px-4 py-2 text-sm font-medium"
        type="submit"
      >
        Apply filters
      </button>
    </form>
  );
}
