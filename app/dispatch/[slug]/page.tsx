import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DispatchDetailClient } from '../components/DispatchDetailClient';
import { getDispatchBoardData, getLoadById } from '../lib/dispatchFetchers';

export default async function LoadDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [load, board] = await Promise.all([getLoadById({ id: slug }), getDispatchBoardData()]);
  if (!load) notFound();
  return (
    <main className="domain-page">
      <p>
        <Link href="/dispatch">← Dispatch board</Link>
      </p>
      <header className="page-header">
        <div>
          <p className="eyebrow">Load detail</p>
          <h1>{load.reference}</h1>
        </div>
        <Link href={`/dispatch/${load.id}/edit`}>Edit load</Link>
      </header>
      <section className="detail-grid">
        <p>
          <strong>Status</strong>
          <br />
          {load.status.replaceAll('_', ' ')}
        </p>
        <p>
          <strong>Pickup</strong>
          <br />
          {[load.pickupAddress, load.pickupCity, load.pickupState].filter(Boolean).join(', ') ||
            'Not provided'}
        </p>
        <p>
          <strong>Pickup time</strong>
          <br />
          {load.pickupScheduledAt?.toLocaleString() ?? 'Not scheduled'}
        </p>
        <p>
          <strong>Delivery</strong>
          <br />
          {[load.dropoffAddress, load.dropoffCity, load.dropoffState].filter(Boolean).join(', ') ||
            'Not provided'}
        </p>
        <p>
          <strong>Delivery time</strong>
          <br />
          {load.dropoffScheduledAt?.toLocaleString() ?? 'Not scheduled'}
        </p>
        <p>
          <strong>Driver / vehicle</strong>
          <br />
          {load.driverId ?? 'Unassigned'} / {load.vehicleId ?? 'Unassigned'}
        </p>
      </section>
      <DispatchDetailClient load={load} drivers={board.drivers} />
      <section>
        <h2>Status history</h2>
        {load.statusEvents.map((event) => (
          <p key={event.id}>
            {event.occurredAt.toLocaleString()} · {event.status.replaceAll('_', ' ')}
            {event.notes ? ` — ${event.notes}` : ''}
          </p>
        ))}
        {!load.statusEvents.length && <p>No status events yet.</p>}
      </section>
    </main>
  );
}
