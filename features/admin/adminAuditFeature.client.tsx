"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AdminAuditTemplate } from "@/components/templates/adminAuditTemplate";
import type { AuditEventDTO } from "@/types/adminTypes";
export function AdminAuditFeatureClient({
  events,
}: {
  events: AuditEventDTO[];
}) {
  const [query, setQuery] = useState("");
  return (
    <AdminAuditTemplate
      events={events.filter((event) =>
        `${event.action} ${event.resourceType} ${event.actor?.displayName ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )}
      toolbar={
        <Input
          aria-label="Search audit events"
          placeholder="Search action, resource or actor"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      }
    />
  );
}
