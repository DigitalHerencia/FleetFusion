import type { Load } from '@prisma/client';

import { DispatchCard } from './DispatchCard';

export function DispatchMobile({ loads }: { loads: Load[] }) {
  return (
    <section className="dispatch-mobile" aria-label="Mobile dispatch loads">
      <h2>Loads</h2>
      {loads.map((load) => (
        <DispatchCard key={load.id} load={load} />
      ))}
      {!loads.length && <p>No loads to display.</p>}
    </section>
  );
}

export default DispatchMobile;
