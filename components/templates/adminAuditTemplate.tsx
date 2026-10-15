import type { ReactNode } from "react";
import type { AuditEventDTO } from "@/types/adminTypes";
import { DashboardLayout } from "@/components/blocks/dashboard-layout";
export function AdminAuditTemplate({
  events,
  toolbar,
}: {
  events: AuditEventDTO[];
  toolbar: ReactNode;
}) {
  return (
    <DashboardLayout title="Audit trail" nav={[]} toolbar={toolbar}>
      <ol className="space-y-3 border-l-4 border-primary pl-5">
        {events.map((event) => (
          <li key={event.id} className="surface-card p-4">
            <p className="type-label">{event.action}</p>
            <p className="mt-2">
              {event.actor?.displayName ?? "System"} · {event.resourceType}
            </p>
            <time className="text-sm text-muted-primary">
              {event.createdAt}
            </time>
            <p className="mt-2 text-xs break-all">
              Resource: {event.resourceId ?? "—"}
            </p>
          </li>
        ))}
      </ol>
      {!events.length && <p>No matching audit events.</p>}
    </DashboardLayout>
  );
}
