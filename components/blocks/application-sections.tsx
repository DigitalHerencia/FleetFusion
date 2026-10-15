import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { IntegrationStatus } from "@/types/integrationTypes";

export interface PageHeaderAction {
  label: string;
  href: string;
}

export function IntegrationStatusGridBlock({
  integrations,
}: {
  integrations: IntegrationStatus[];
}) {
  return (
    <section className="grid gap-4 py-6 md:grid-cols-2 xl:grid-cols-3">
      {integrations.map((integration) => (
        <Card key={integration.name}>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>{integration.name}</CardTitle>
              <Badge
                variant={
                  integration.state === "CONFIGURED" ? "default" : "outline"
                }
              >
                {integration.state}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {integration.purpose}
            </p>
            <Badge variant="secondary">{integration.mode}</Badge>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export function PageHeaderBlock({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: PageHeaderAction;
}) {
  return (
    <header className="flex flex-col gap-5 border-b-3 border-foreground py-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl space-y-2">
        {eyebrow ? (
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : null}
    </header>
  );
}

export interface MetricItem {
  label: string;
  value: string;
  detail?: string;
}

export function MetricGridBlock({ metrics }: { metrics: MetricItem[] }) {
  return (
    <section className="grid gap-4 py-6 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
              {metric.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{metric.value}</p>
            {metric.detail ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {metric.detail}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export interface DataTableColumn {
  key: string;
  label: string;
}

export interface DataTableRow {
  id: string;
  href?: string;
  cells: Record<string, string | null>;
}

export function DataTableToolbarBlock({
  query,
  onQueryChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  resultCount,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  resultCount: number;
}) {
  return (
    <div className="grid gap-3 border-3 border-foreground bg-card p-4 sm:grid-cols-[minmax(0,1fr)_12rem_12rem_auto] sm:items-center">
      <Input
        aria-label="Search contacts"
        type="search"
        placeholder="Search name or email"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <select
        aria-label="Filter by status"
        className="h-11 border-3 border-input bg-background px-3 text-sm font-bold uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
      >
        <option value="all">All statuses</option>
        <option value="LEAD">Lead</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </select>
      <select
        aria-label="Sort contacts"
        className="h-11 border-3 border-input bg-background px-3 text-sm font-bold uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={sort}
        onChange={(event) => onSortChange(event.target.value)}
      >
        <option value="name-asc">Name A–Z</option>
        <option value="name-desc">Name Z–A</option>
        <option value="updated-desc">Recently updated</option>
      </select>
      <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
        {resultCount} records
      </p>
    </div>
  );
}

export function DataTableBlock({
  columns,
  rows,
  emptyMessage = "No records match the active organization and filters.",
}: {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return <EmptyStateBlock title="No records" description={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto border-3 border-foreground bg-card shadow-[5px_5px_0px_hsl(var(--shadow-color))]">
      <table className="w-full min-w-2xl border-collapse text-sm">
        <thead className="bg-muted">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="border-b-3 border-foreground px-4 py-3 text-left text-xs font-black uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b last:border-b-0">
              {columns.map((column, index) => {
                const value = row.cells[column.key] ?? "—";
                return (
                  <td key={column.key} className="px-4 py-3 align-top">
                    {index === 0 && row.href ? (
                      <Link
                        className="font-bold underline-offset-4 hover:underline"
                        href={row.href}
                      >
                        {value}
                      </Link>
                    ) : (
                      value
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface DetailItem {
  label: string;
  value: ReactNode;
}

export function RecordDetailBlock({
  title,
  status,
  items,
  children,
}: {
  title: string;
  status?: string;
  items: DetailItem[];
  children?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <CardTitle className="text-2xl uppercase">{title}</CardTitle>
        {status ? <Badge variant="outline">{status}</Badge> : null}
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.label} className="border-l-3 border-primary pl-3">
              <dt className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                {item.label}
              </dt>
              <dd className="mt-1 font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
        {children}
      </CardContent>
    </Card>
  );
}

export interface BoardColumn {
  id: string;
  title: string;
  items: Array<{ id: string; title: string; detail?: string; href?: string }>;
}

export function KanbanBoardBlock({ columns }: { columns: BoardColumn[] }) {
  return (
    <section className="grid items-start gap-4 overflow-x-auto py-6 lg:grid-cols-3">
      {columns.map((column) => (
        <div
          key={column.id}
          className="min-w-64 border-3 border-foreground bg-muted/40 p-3"
        >
          <h2 className="mb-3 flex items-center justify-between text-sm font-black uppercase tracking-wider">
            {column.title}
            <Badge variant="outline">{column.items.length}</Badge>
          </h2>
          <div className="space-y-3">
            {column.items.map((item) => (
              <article
                key={item.id}
                className="border-2 border-foreground bg-card p-3 shadow-[3px_3px_0px_hsl(var(--shadow-color))]"
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className="font-bold underline-offset-4 hover:underline"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <h3 className="font-bold">{item.title}</h3>
                )}
                {item.detail ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.detail}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export function TimelineBlock({
  items,
}: {
  items: Array<{
    id: string;
    title: string;
    timestamp: string;
    detail?: string;
  }>;
}) {
  return (
    <ol className="space-y-0 border-l-3 border-foreground pl-6">
      {items.map((item) => (
        <li key={item.id} className="relative pb-7 last:pb-0">
          <span className="absolute -left-[1.95rem] top-1 size-3 border-2 border-foreground bg-primary" />
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {item.timestamp}
          </p>
          <h3 className="font-black">{item.title}</h3>
          {item.detail ? (
            <p className="text-sm text-muted-foreground">{item.detail}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function SplitPaneBlock({
  primary,
  secondary,
}: {
  primary: ReactNode;
  secondary: ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
      <div>{primary}</div>
      <aside>{secondary}</aside>
    </div>
  );
}

export function FileVaultBlock({
  files,
}: {
  files: Array<{ id: string; name: string; meta: string; href?: string }>;
}) {
  return (
    <DataTableBlock
      columns={[
        { key: "name", label: "File" },
        { key: "meta", label: "Details" },
      ]}
      rows={files.map((file) => ({
        id: file.id,
        href: file.href,
        cells: { name: file.name, meta: file.meta },
      }))}
      emptyMessage="No files are visible in this workspace."
    />
  );
}

export function MediaLibraryBlock({
  items,
}: {
  items: Array<{ id: string; title: string; description?: string }>;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id}>
          <div className="aspect-video border-b-3 border-foreground bg-muted" />
          <CardContent className="pt-4">
            <h3 className="font-black">{item.title}</h3>
            {item.description ? (
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export function ChatWorkspaceBlock({
  messages,
}: {
  messages: Array<{
    id: string;
    author: string;
    body: string;
    internal?: boolean;
  }>;
}) {
  return (
    <section className="space-y-3">
      {messages.map((message) => (
        <article
          key={message.id}
          className={cn(
            "max-w-3xl border-2 border-foreground p-4",
            message.internal ? "bg-warning/20" : "bg-card",
          )}
        >
          <p className="text-xs font-black uppercase tracking-wider">
            {message.author}
            {message.internal ? " · Internal" : ""}
          </p>
          <p className="mt-2 whitespace-pre-wrap">{message.body}</p>
        </article>
      ))}
    </section>
  );
}

export function AuditLogBlock({
  events,
}: {
  events: Array<{
    id: string;
    action: string;
    resource: string;
    timestamp: string;
  }>;
}) {
  return (
    <TimelineBlock
      items={events.map((event) => ({
        id: event.id,
        title: event.action,
        detail: event.resource,
        timestamp: event.timestamp,
      }))}
    />
  );
}

export function EmptyStateBlock({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: PageHeaderAction;
}) {
  return (
    <section className="grid min-h-56 place-items-center border-3 border-dashed border-foreground p-8 text-center">
      <div className="max-w-md space-y-3">
        <h2 className="text-xl font-black uppercase">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        {action ? (
          <Button asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
