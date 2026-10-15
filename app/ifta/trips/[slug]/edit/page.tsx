import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getVehicles } from '@/vehicles/lib/vehiclesFetchers';

import { IftaHeader } from '../../../components/IftaHeader';
import { IftaTripForm } from '../../../components/IftaTripForm';
import { getTripById } from '../../../lib/iftaFetchers';
import type { IftaTrip } from '../../../types';

interface EditIftaTripPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditIftaTripPage({ params }: EditIftaTripPageProps) {
  const { slug } = await params;
  const [trip, vehicles] = await Promise.all([
    (getTripById as unknown as (input: { id: string }) => Promise<IftaTrip | null>)({ id: slug }),
    getVehicles({ page: 1, pageSize: 100 }),
  ]);
  if (!trip) notFound();

  const options = vehicles.map(({ id, name }) => ({ id, name: name ?? id }));
  if (!options.some((vehicle) => vehicle.id === trip.vehicleId)) {
    options.push({ id: trip.vehicleId, name: trip.vehicle?.name ?? trip.vehicleId });
  }

  return (
    <main className="space-y-6 p-6">
      <IftaHeader
        description="Update dates, total mileage, and jurisdiction allocations for this trip."
        title={`Edit trip ${trip.tripNumber}`}
      />
      <IftaTripForm initialData={trip} vehicles={options} />
      <Link className="text-sm underline" href={`/ifta/trips/${trip.id}`}>
        Cancel and return to trip
      </Link>
    </main>
  );
}
