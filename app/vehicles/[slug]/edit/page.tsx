import { notFound } from 'next/navigation';

import { VehicleForm } from '../../components/VehicleForm';
import { getVehicleById } from '../../lib/vehiclesFetchers';

interface EditVehiclePageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditVehiclePage({ params }: EditVehiclePageProps) {
  const { slug } = await params;
  const vehicle = await getVehicleById({ id: slug });
  if (!vehicle) {
    notFound();
  }
  return (
    <VehicleForm
      initialData={{
        id: vehicle.id,
        name: vehicle.name ?? '',
        vin: vehicle.vin ?? '',
        ...(vehicle.plateNumber !== null ? { plateNumber: vehicle.plateNumber } : {}),
        ...(vehicle.plateState !== null ? { plateState: vehicle.plateState } : {}),
        ...(vehicle.type !== null ? { type: vehicle.type } : {}),
        status: vehicle.status,
        ...(vehicle.year !== null ? { year: vehicle.year } : {}),
        ...(vehicle.make !== null ? { make: vehicle.make } : {}),
        ...(vehicle.model !== null ? { model: vehicle.model } : {}),
        ...(vehicle.odometer !== null ? { odometer: vehicle.odometer } : {}),
        ...(vehicle.fuelType !== null ? { fuelType: vehicle.fuelType } : {}),
        ...(vehicle.axleCount !== null ? { axleCount: vehicle.axleCount } : {}),
        ...(vehicle.deletedAt !== null ? { deletedAt: vehicle.deletedAt } : {}),
      }}
    />
  );
}
