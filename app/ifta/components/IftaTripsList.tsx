import Link from 'next/link';

import type { IftaTrip } from '../types';

interface IftaTripsListProps {
  trips: IftaTrip[];
}

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

export function IftaTripsList({ trips }: IftaTripsListProps) {
  if (trips.length === 0) {
    return (
      <section className="rounded-lg border border-dashed p-8 text-center">
        <h2 className="font-medium">No IFTA trips recorded</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Add a trip with its jurisdiction mileage breakdown to begin reporting.
        </p>
        <Link className="mt-4 inline-block text-sm font-medium underline" href="/ifta/trips/new">
          Add a trip
        </Link>
      </section>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Trip</th>
            <th className="px-4 py-3 font-medium">Vehicle</th>
            <th className="px-4 py-3 font-medium">Started</th>
            <th className="px-4 py-3 font-medium">Ended</th>
            <th className="px-4 py-3 text-right font-medium">Total miles</th>
            <th className="px-4 py-3 font-medium">Jurisdictions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {trips.map((trip) => (
            <tr className="hover:bg-muted/30" key={trip.id}>
              <td className="px-4 py-3">
                <Link
                  className="font-medium underline-offset-4 hover:underline"
                  href={`/ifta/trips/${trip.id}`}
                >
                  {trip.tripNumber}
                </Link>
              </td>
              <td className="px-4 py-3">{trip.vehicle?.name ?? trip.vehicleId}</td>
              <td className="px-4 py-3">{formatDate(trip.startedAt)}</td>
              <td className="px-4 py-3">
                {trip.endedAt ? formatDate(trip.endedAt) : 'In progress'}
              </td>
              <td className="px-4 py-3 text-right">
                {trip.totalMiles === null ? '—' : trip.totalMiles.toLocaleString()}
              </td>
              <td className="px-4 py-3">
                {trip.jurisdictionMiles
                  ? Object.keys(trip.jurisdictionMiles).sort().join(', ')
                  : 'Not entered'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
