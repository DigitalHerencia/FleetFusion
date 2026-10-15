import type { Load } from '@prisma/client';
import Link from 'next/link';

export function DispatchCard({ load }: { load: Load }) {
  return (
    <article className="dispatch-card">
      <header>
        <Link href={`/dispatch/${load.id}`}>
          <strong>{load.reference}</strong>
        </Link>
        <span className={`status status-${load.status.toLowerCase()}`}>
          {load.status.replaceAll('_', ' ')}
        </span>
      </header>
      <p>
        {load.pickupCity ?? 'Pickup TBD'}
        {load.pickupState ? `, ${load.pickupState}` : ''} → {load.dropoffCity ?? 'Delivery TBD'}
        {load.dropoffState ? `, ${load.dropoffState}` : ''}
      </p>
      <dl>
        <div>
          <dt>Pickup</dt>
          <dd>{load.pickupScheduledAt?.toLocaleString() ?? 'Not scheduled'}</dd>
        </div>
        <div>
          <dt>Rate</dt>
          <dd>
            {load.rateCents == null
              ? '—'
              : new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: load.currency ?? 'USD',
                }).format(load.rateCents / 100)}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export default DispatchCard;
