import { VehiclesHeader } from './components/VehiclesHeader';
import { VehiclesList } from './components/VehiclesList';
import { getVehicles } from './lib/vehiclesFetchers';

export default async function VehiclesPage() {
  // Fetch the first page of vehicles (50 per page) for display
  const vehicles = await getVehicles({ page: 1, pageSize: 50 });

  return (
    <main className="space-y-4 p-6">
      {/* Page header showing title and total count */}
      <VehiclesHeader total={vehicles.length} />
      {/* List of vehicle cards */}
      <VehiclesList vehicles={vehicles} />
    </main>
  );
}
