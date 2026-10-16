"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DispatchTemplate } from "@/components/templates/dispatchTemplate";
import { Input } from "@/components/ui/input";
import type { LoadSummaryDTO } from "@/types/dispatchTypes";
import type { DispatchBoardColumn } from "@/lib/workflows/dispatchWorkflows";

type DispatchBoardData = {
  columns: DispatchBoardColumn[];
  loads: LoadSummaryDTO[];
  total: number;
  active: number;
  unassigned: number;
  delivered: number;
};

const statusOptions = [
  ["", "All statuses"],
  ["DRAFT", "Draft"],
  ["BOOKED", "Booked"],
  ["DISPATCHED", "Dispatched"],
  ["AT_PICKUP", "At pickup"],
  ["IN_TRANSIT", "In transit"],
  ["AT_DELIVERY", "At delivery"],
  ["DELIVERED", "Delivered"],
  ["CANCELED", "Canceled"],
];

export function DispatchFeatureClient({ board }: { board: DispatchBoardData }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const visibleIds = new Set(
    board.loads
      .filter((load) => {
        const searchText = [
          String(load.number),
          load.referenceNumber ?? "",
          load.customer?.name ?? "",
          load.driver?.name ?? "",
          load.vehicle?.unitNumber ?? "",
          ...load.stops.flatMap((stop) => [stop.locationName ?? "", stop.city, stop.state]),
        ].join(" ").toLowerCase();
        const statusMatches =
          !status ||
          load.status === status ||
          (status === "IN_TRANSIT" && ["AT_PICKUP", "IN_TRANSIT", "AT_DELIVERY"].includes(load.status));
        return statusMatches && searchText.includes(query.trim().toLowerCase());
      })
      .map((load) => load.id),
  );

  const columns = board.columns.map((column) => ({
    ...column,
    loads: column.loads.filter((load) => visibleIds.has(load.id)),
  }));

  return (
    <DispatchTemplate
      columns={columns}
      stats={[
        { label: "Loads in records", value: String(board.total) },
        { label: "Active loads", value: String(board.active) },
        { label: "Need assignment", value: String(board.unassigned) },
        { label: "Delivered", value: String(board.delivered) },
      ]}
      toolbar={
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild><Link href="/dispatch/new">Book load</Link></Button>
          <Input
            aria-label="Search loads"
            placeholder="Search load, customer, driver, truck…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="control-field"
            aria-label="Load status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      }
    />
  );
}
