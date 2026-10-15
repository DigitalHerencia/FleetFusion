import Link from 'next/link';

import type { IftaFuelPurchase, IftaTrip } from '../types';

type IftaDetailClientProps =
  { kind: 'trip'; record: IftaTrip } | { kind: 'fuel'; record: IftaFuelPurchase };

function formatDate(value: Date | string | null | undefined) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function IftaDetailClient({ kind, record }: IftaDetailClientProps) {
  if (kind === 'trip') {
    const trip = record as IftaTrip;
    const jurisdictionMiles = trip.jurisdictionMiles ?? {};
    return (
      <section className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm">IFTA trip</p>
            <h1 className="mt-1 text-2xl font-semibold">{trip.tripNumber}</h1>
          </div>
          <Link
            className="hover:bg-muted rounded-md border px-4 py-2 text-sm font-medium"
            href={`/ifta/trips/${trip.id}/edit`}
          >
            Edit trip
          </Link>
        </header>
        <dl className="grid gap-4 rounded-lg border p-5 sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground text-sm">Vehicle</dt>
            <dd className="mt-1 font-medium">{trip.vehicle?.name ?? trip.vehicleId}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Driver</dt>
            <dd className="mt-1 font-medium">{trip.driverId ?? 'Not assigned'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Started</dt>
            <dd className="mt-1 font-medium">{formatDate(trip.startedAt)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Ended</dt>
            <dd className="mt-1 font-medium">{formatDate(trip.endedAt)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Total trip miles</dt>
            <dd className="mt-1 font-medium">
              {trip.totalMiles === null ? 'Not entered' : trip.totalMiles.toLocaleString()}
            </dd>
          </div>
        </dl>
        <section className="rounded-lg border">
          <h2 className="border-b px-5 py-4 font-semibold">Miles by jurisdiction</h2>
          {Object.keys(jurisdictionMiles).length ? (
            <ul className="divide-y">
              {Object.entries(jurisdictionMiles)
                .sort(([left], [right]) => left.localeCompare(right))
                .map(([jurisdiction, miles]) => (
                  <li className="flex justify-between gap-4 px-5 py-3 text-sm" key={jurisdiction}>
                    <span>{jurisdiction}</span>
                    <span className="font-medium">{miles.toLocaleString()} mi</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-muted-foreground px-5 py-4 text-sm">
              No jurisdiction mileage has been entered for this trip.
            </p>
          )}
        </section>
        <Link className="text-sm underline" href="/ifta/trips">
          Back to trips
        </Link>
      </section>
    );
  }

  const purchase = record as IftaFuelPurchase;
  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">IFTA fuel purchase</p>
          <h1 className="mt-1 text-2xl font-semibold">{formatDate(purchase.purchaseDate)}</h1>
        </div>
        <Link
          className="hover:bg-muted rounded-md border px-4 py-2 text-sm font-medium"
          href={`/ifta/fuel/${purchase.id}/edit`}
        >
          Edit purchase
        </Link>
      </header>
      <dl className="grid gap-4 rounded-lg border p-5 sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground text-sm">Vehicle</dt>
          <dd className="mt-1 font-medium">{purchase.vehicle?.name ?? purchase.vehicleId}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-sm">Purchase jurisdiction</dt>
          <dd className="mt-1 font-medium">{purchase.jurisdiction}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-sm">Gallons purchased</dt>
          <dd className="mt-1 font-medium">{purchase.gallons.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-sm">Purchase amount</dt>
          <dd className="mt-1 font-medium">
            {new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: purchase.currency || 'USD',
            }).format(purchase.amountCents / 100)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-sm">Vendor</dt>
          <dd className="mt-1 font-medium">{purchase.vendor ?? 'Not provided'}</dd>
        </div>
      </dl>
      <p className="text-muted-foreground text-sm">
        This records fuel purchased in {purchase.jurisdiction}; it does not represent fuel consumed
        there.
      </p>
      <Link className="text-sm underline" href="/ifta/fuel">
        Back to fuel purchases
      </Link>
    </section>
  );
}
