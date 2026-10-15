import type { ReactNode } from "react";
import { DashboardLayout, type DashboardStat } from "@/components/blocks/dashboard-layout";
import type { LoadSummaryDTO } from "@/types/dispatchTypes";
import type { DispatchBoardColumn } from "@/lib/workflows/dispatchWorkflows";

function money(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount)
    : value;
}

function stopLabel(load: LoadSummaryDTO, type: "PICKUP" | "DELIVERY") {
  const stop = load.stops.find((item) => item.type === type) ??
    (type === "PICKUP" ? load.stops[0] : load.stops[load.stops.length - 1]);
  if (!stop) return "Stop not entered";
  return [stop.locationName, [stop.city, stop.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ");
}

function LoadCard({ load }: { load: LoadSummaryDTO }) {
  return (
    <article className="surface-card space-y-3 p-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="type-title">Load #{load.number}</h3>
          <p className="type-caption text-muted-primary">{load.referenceNumber ?? "No reference number"}</p>
        </div>
        <strong className="text-sm">{money(load.rate)}</strong>
      </header>
      <div className="space-y-2 text-sm">
        <p><span className="type-caption text-muted-primary">PICKUP </span>{stopLabel(load, "PICKUP")}</p>
        <p><span className="type-caption text-muted-primary">DELIVERY </span>{stopLabel(load, "DELIVERY")}</p>
      </div>
      <div className="flex flex-wrap justify-between gap-2 border-t border-foreground/15 pt-3 text-sm">
        <span>{load.customer?.name ?? "No customer"}</span>
        <span className="text-muted-primary">{load.driver?.name ?? "Unassigned driver"} · {load.vehicle?.unitNumber ?? "No truck"}</span>
      </div>
      <p className="type-caption text-muted-primary">
        {load.miles == null ? "Miles not entered" : `${load.miles.toLocaleString()} mi`}
        {load.podReceivedAt ? " · POD received" : ""}
      </p>
    </article>
  );
}

export function DispatchTemplate({
  columns,
  stats,
  toolbar,
}: {
  columns: readonly DispatchBoardColumn[];
  stats: readonly DashboardStat[];
  toolbar: ReactNode;
}) {
  return (
    <DashboardLayout title="Dispatch" nav={[]} stats={stats} toolbar={toolbar}>
      <p className="text-muted-primary">Track booked loads, assignments, movement, delivery, and exceptions.</p>
      <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        {columns.map((column) => (
          <section className="min-w-0 space-y-3" key={column.id} aria-label={column.title}>
            <header className="flex items-center justify-between border-b border-foreground/25 pb-2">
              <h2 className="type-label uppercase">{column.title}</h2>
              <span className="type-caption text-muted-primary">{column.loads.length}</span>
            </header>
            <div className="space-y-3">
              {column.loads.map((load) => <LoadCard key={load.id} load={load} />)}
              {column.loads.length === 0 && (
                <p className="surface-inset p-4 text-sm text-muted-primary">No loads in this column.</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </DashboardLayout>
  );
}
