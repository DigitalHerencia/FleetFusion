type DashboardKpi = { id: string; label: string; value: number; format?: string };

export function AnalyticsDashboardCards({ kpis }: { kpis: DashboardKpi[] }) {
  return (
    <section
      aria-label="Key performance indicators"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      {kpis.map((kpi) => (
        <article className="bg-card rounded-lg border p-5 shadow-sm" key={kpi.id}>
          <p className="text-muted-foreground text-sm">{kpi.label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {kpi.format === 'percent'
              ? `${(kpi.value * 100).toFixed(1)}%`
              : kpi.value.toLocaleString()}
          </p>
        </article>
      ))}
      {!kpis.length && (
        <p className="text-muted-foreground text-sm">No KPI data is available yet.</p>
      )}
    </section>
  );
}
