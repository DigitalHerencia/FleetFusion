import type { Driver } from '@prisma/client';

import { DriverCard } from './DriverCard';

export function DriversList({ drivers }: { drivers: Driver[] }) {
  return drivers.length ? (
    <section className="drivers-list" aria-label="Drivers">
      {drivers.map((driver) => (
        <DriverCard key={driver.id} driver={driver} />
      ))}
    </section>
  ) : (
    <section className="empty-state">
      <h2>No drivers found</h2>
      <p>Add a driver or adjust your filters.</p>
    </section>
  );
}

export default DriversList;
