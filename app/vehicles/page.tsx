import { VehiclesFilters } from './components/VehiclesFilters';
import { VehiclesHeader } from './components/VehiclesHeader';
import { VehiclesList } from './components/VehiclesList';
import { getVehicles } from './lib/vehiclesFetchers';

interface VehiclesPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  const params = (await searchParams) ?? {};
  const filters = Object.fromEntries(
    Object.entries(params).flatMap(([key, value]) => {
      const firstValue = Array.isArray(value) ? value[0] : value;
      return firstValue === undefined || firstValue === '' ? [] : [[key, firstValue]];
    }),
  );
  const vehicles = await getVehicles({ page: 1, pageSize: 50, ...filters });

  return (
    <main className="space-y-4 p-6">
      <VehiclesHeader total={vehicles.length} />
      <VehiclesFilters
        search={typeof filters['search'] === 'string' ? filters['search'] : ''}
        status={typeof filters['status'] === 'string' ? filters['status'] : ''}
        type={typeof filters['type'] === 'string' ? filters['type'] : ''}
      />
      <VehiclesList vehicles={vehicles} />
    </main>
  );
}
