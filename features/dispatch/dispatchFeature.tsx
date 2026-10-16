import { DispatchFeatureClient } from "@/features/dispatch/dispatchFeature.client";
import { getDrivers, getVehicles } from "@/lib/fetchers/fleetFetchers";
import { getDispatchBoardWorkflow } from "@/lib/workflows/dispatchWorkflows";

export async function DispatchFeature() {
  const [board, drivers, vehicles] = await Promise.all([
    getDispatchBoardWorkflow(),
    getDrivers(),
    getVehicles(),
  ]);
  return (
    <DispatchFeatureClient
      board={board}
      drivers={drivers.map(({ id, firstName, lastName, status }) => ({ id, firstName, lastName, status }))}
      vehicles={vehicles.map(({ id, unitNumber, status }) => ({ id, unitNumber, status }))}
    />
  );
}
