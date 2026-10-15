import { getLoad, getLoads } from "@/lib/fetchers/dispatchFetchers";

export async function getDispatchBoardWorkflow(limit = 200) {
  const loads = await getLoads(limit);
  const columns = {
    BOOKED: loads.filter((l) => l.status === "BOOKED"),
    DISPATCHED: loads.filter((l) => l.status === "DISPATCHED"),
    IN_TRANSIT: loads.filter((l) =>
      ["AT_PICKUP", "IN_TRANSIT", "AT_DELIVERY"].includes(l.status),
    ),
    DELIVERED: loads.filter((l) => l.status === "DELIVERED"),
  };
  const unassigned = loads.filter(
    (l) => ["DRAFT", "BOOKED"].includes(l.status) && (!l.driver || !l.vehicle),
  ).length;
  return { columns, unassigned, total: loads.length };
}

export async function getLoadWorkspaceWorkflow(loadId: string) {
  const load = await getLoad(loadId);
  if (!load) throw new Error("Load was not found.");
  return { load };
}