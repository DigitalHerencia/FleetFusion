import { getLoad, getLoads } from "@/lib/fetchers/dispatchFetchers";
import type { LoadSummaryDTO } from "@/types/dispatchTypes";

export interface DispatchBoardColumn {
  id: "DRAFT" | "BOOKED" | "DISPATCHED" | "IN_TRANSIT" | "DELIVERED" | "CANCELED";
  title: string;
  loads: LoadSummaryDTO[];
}

const IN_TRANSIT_STATUSES = ["AT_PICKUP", "IN_TRANSIT", "AT_DELIVERY"] as const;
const ACTIVE_STATUSES = ["BOOKED", "DISPATCHED", "AT_PICKUP", "IN_TRANSIT", "AT_DELIVERY"] as const;

export async function getDispatchBoardWorkflow(limit = 200) {
  const loads = await getLoads(limit);
  const columns: DispatchBoardColumn[] = [
    { id: "DRAFT", title: "Draft", loads: loads.filter((load) => load.status === "DRAFT") },
    { id: "BOOKED", title: "Booked", loads: loads.filter((load) => load.status === "BOOKED") },
    { id: "DISPATCHED", title: "Dispatched", loads: loads.filter((load) => load.status === "DISPATCHED") },
    { id: "IN_TRANSIT", title: "In transit", loads: loads.filter((load) => IN_TRANSIT_STATUSES.some((status) => status === load.status)) },
    { id: "DELIVERED", title: "Delivered", loads: loads.filter((load) => load.status === "DELIVERED") },
    { id: "CANCELED", title: "Canceled", loads: loads.filter((load) => load.status === "CANCELED") },
  ];

  return {
    columns,
    loads,
    total: loads.length,
    active: loads.filter((load) => ACTIVE_STATUSES.some((status) => status === load.status)).length,
    unassigned: loads.filter(
      (load) => (load.status === "DRAFT" || load.status === "BOOKED") && (!load.driver || !load.vehicle),
    ).length,
    delivered: loads.filter((load) => load.status === "DELIVERED").length,
  };
}

export async function getLoadWorkspaceWorkflow(loadId: string) {
  const load = await getLoad(loadId);
  if (!load) return null;
  return { load };
}
