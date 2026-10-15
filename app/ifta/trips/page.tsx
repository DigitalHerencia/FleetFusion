import { IftaFilters } from '../components/IftaFilters';
import { IftaHeader } from '../components/IftaHeader';
import { IftaMobile } from '../components/IftaMobile';
import { IftaTripsList } from '../components/IftaTripsList';
import { listTrips } from '../lib/iftaFetchers';
import type { IftaTrip } from '../types';

interface IftaTripsPageProps {
  searchParams: Promise<{ search?: string; quarter?: string; year?: string }>;
}

function matchesQuarter(value: Date | string, quarter: string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return `Q${Math.floor(date.getUTCMonth() / 3) + 1}` === quarter;
}

export default async function IftaTripsPage({ searchParams }: IftaTripsPageProps) {
  const [trips, filters] = await Promise.all([listTrips(), searchParams]);
  const search = filters.search?.trim().toLocaleLowerCase() ?? '';
  const quarter = filters.quarter ?? '';
  const year = Number(filters.year);
  const yearFilter = Number.isInteger(year) && year >= 2000 ? year : undefined;
  const filteredTrips = (trips as IftaTrip[])
    .filter((trip) => {
      const textMatch =
        !search ||
        [trip.tripNumber, trip.vehicle?.name, trip.vehicleId, trip.driverId]
          .filter(Boolean)
          .some((value) => value?.toLocaleLowerCase().includes(search));
      const quarterMatch = !quarter || matchesQuarter(trip.startedAt, quarter);
      const yearMatch =
        yearFilter === undefined || new Date(trip.startedAt).getUTCFullYear() === yearFilter;
      return textMatch && quarterMatch && yearMatch;
    })
    .sort(
      (left, right) => new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime(),
    );

  return (
    <main className="space-y-6 p-6">
      <IftaMobile />
      <IftaHeader
        createHref="/ifta/trips/new"
        createLabel="Record trip"
        description="Capture trip totals and miles traveled in each IFTA jurisdiction."
        title="IFTA trips"
        total={filteredTrips.length}
      />
      <IftaFilters
        action="/ifta/trips"
        period={quarter}
        search={filters.search ?? ''}
        year={filters.year ?? ''}
      />
      <IftaTripsList trips={filteredTrips} />
    </main>
  );
}
