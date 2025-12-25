import type { Vehicle } from '@prisma/client';

import { VehicleCard } from './VehicleCard';

interface VehiclesListProps {
  vehicles: Vehicle[];
}

/**
 * VehiclesList renders a list of vehicles as a grid of cards.
 */
export function VehiclesList({ vehicles }: VehiclesListProps) {
  return (
    <section className="grid gap-3">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </section>
  );
}
