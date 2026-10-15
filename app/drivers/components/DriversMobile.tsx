import type { Driver } from '@prisma/client';

import { DriverCard } from './DriverCard';

export function DriversMobile({ drivers }: { drivers: Driver[] }) {
  return (
    <section className="drivers-mobile" aria-label="Mobile driver list">
      <h2>Drivers</h2>
      {drivers.map((driver) => (
        <DriverCard key={driver.id} driver={driver} />
      ))}
      {!drivers.length && <p>No drivers found.</p>}
    </section>
  );
}

export default DriversMobile;
