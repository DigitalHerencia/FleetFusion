'use client';

type ChartPoint = { label: string; value: number };

export function AnalyticsChartRenderer({ title, data }: { title: string; data: ChartPoint[] }) {
  const max = Math.max(1, ...data.map((point) => point.value));
  return (
    <figure className="bg-card rounded-lg border p-5">
      <figcaption className="mb-5 font-semibold">{title}</figcaption>
      {data.length ? (
        <div
          aria-label={`${title} bar chart`}
          className="flex min-h-52 items-end gap-3 overflow-x-auto"
          role="img"
        >
          {data.map((point, index) => (
            <div
              className="flex min-w-12 flex-1 flex-col items-center gap-2"
              key={`${point.label}-${index}`}
            >
              <span className="text-muted-foreground text-xs tabular-nums">
                {point.value.toLocaleString()}
              </span>
              <div
                className="bg-primary/80 w-full min-w-6 rounded-t"
                style={{ height: `${Math.max(4, (point.value / max) * 150)}px` }}
              />
              <span className="text-muted-foreground max-w-full truncate text-xs">
                {point.label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground py-12 text-center text-sm">
          No activity recorded for this period.
        </p>
      )}
    </figure>
  );
}
