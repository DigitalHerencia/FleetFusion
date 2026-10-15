import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface DashboardNavItem {
  label: string;
  href?: string | undefined;
  active?: boolean;
}

export interface DashboardStat {
  label: string;
  value: string;
  trend?: string;
}

export interface DashboardLayoutProps {
  title: string;
  nav: readonly DashboardNavItem[];
  stats?: readonly DashboardStat[];
  toolbar?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
}

export function DashboardLayout({
  title,
  stats = [],
  toolbar,
  children,
  aside,
  className,
}: DashboardLayoutProps) {
  return (
    <section className={cn("dashboard-layout w-full bg-background", className)}>
      <div className="min-w-0 bg-background">
        <header className="dashboard-header grid min-h-14 gap-3 border-b border-foreground/30 px-4 py-4 md:flex md:justify-between">
          <h1 className="type-title text-foreground">{title}</h1>
          {toolbar}
        </header>

        <div className="space-y-4 p-4">
          {stats.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <DashboardStatCard key={stat.label} {...stat} />
              ))}
            </div>
          ) : null}
          {children}
        </div>
      </div>

      {aside && (
        <aside className="border-t border-foreground/30 bg-background p-4">
          {aside}
        </aside>
      )}
    </section>
  );
}

export function DashboardStatCard({ label, value, trend }: DashboardStat) {
  return (
    <article className="surface-card p-4">
      <p className="type-caption tracking-wider text-muted-primary uppercase">
        {label}
      </p>
      <p className="mt-1 font-sans text-2xl font-bold text-foreground">
        {value}
      </p>
      {trend ? (
        <p className="mt-1 type-caption text-muted-primary">{trend}</p>
      ) : null}
    </article>
  );
}

export function DashboardPanel({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card", className)}>
      {title ? (
        <h2 className="border-b border-foreground/20 px-4 py-3 type-label uppercase">
          {title}
        </h2>
      ) : null}
      <div className="p-3">{children}</div>
    </section>
  );
}

export interface DashboardTableColumn {
  key: string;
  label: string;
}

export interface DashboardTableRow {
  id: string;
  href?: string | undefined;
  cells: Record<string, ReactNode>;
}

export interface CanonicalDashboardTemplateProps {
  stats?: readonly DashboardStat[];
  columns?: readonly DashboardTableColumn[];
  rows?: readonly DashboardTableRow[];
  toolbar?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  chartValues?: readonly number[];
}

export function DashboardTable({
  columns,
  rows,
  emptyLabel = "No records available.",
}: {
  columns: readonly DashboardTableColumn[];
  rows: readonly DashboardTableRow[];
  emptyLabel?: string;
}) {
  return (
    <div className="overflow-x-auto border border-foreground/30">
      <table className="w-full min-w-[36rem] border-collapse font-sans text-sm">
        <thead className="bg-primary/15 text-muted-primary">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="border-b border-foreground/30 px-3 py-2 text-left tracking-wider uppercase"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-foreground/20 last:border-0"
              >
                {columns.map((column, index) => (
                  <td key={column.key} className="px-3 py-2 text-foreground">
                    {index === 0 && row.href ? (
                      <Link
                        className="text-foreground hover:underline"
                        href={row.href}
                      >
                        {row.cells[column.key] ?? "—"}
                      </Link>
                    ) : (
                      (row.cells[column.key] ?? "—")
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                className="px-3 py-8 text-center text-muted-primary"
                colSpan={columns.length}
              >
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardBars({
  values,
  label,
}: {
  values: readonly number[];
  label: string;
}) {
  const maximum = Math.max(1, ...values);
  return (
    <div aria-label={label} className="flex h-40 items-end gap-2" role="img">
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className="min-h-1 flex-1 border border-muted-primary bg-primary"
          style={{ height: `${Math.max(4, (value / maximum) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function DashboardRailList({
  items,
}: {
  items: readonly { label: string; value?: string; meta?: string }[];
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <article
          key={`${item.label}-${item.value ?? ""}`}
          className="surface-inset p-3"
        >
          <p className="type-label text-foreground">{item.label}</p>
          {item.value ? (
            <p className="mt-1 type-caption text-foreground">{item.value}</p>
          ) : null}
          {item.meta ? (
            <p className="mt-1 type-caption text-muted-primary">{item.meta}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
