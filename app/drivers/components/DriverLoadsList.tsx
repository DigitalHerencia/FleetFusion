import type { Load } from '@prisma/client';
import Link from 'next/link';

export function DriverLoadsList({ loads }: { loads: Load[] }) {
  return (
    <section>
      <h2>Recent loads</h2>
      {loads.map((load) => (
        <article key={load.id}>
          <Link href={`/dispatch/${load.id}`}>
            <strong>{load.reference}</strong>
          </Link>
          <span>{load.status.replaceAll('_', ' ')}</span>
          <p>
            {load.pickupCity ?? 'Pickup'} → {load.dropoffCity ?? 'Delivery'}
          </p>
        </article>
      ))}
      {!loads.length && <p>No load history is available.</p>}
    </section>
  );
}

export default DriverLoadsList;
