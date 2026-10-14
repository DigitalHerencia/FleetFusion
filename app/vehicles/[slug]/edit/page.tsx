import { notFound } from 'next/navigation';

import { VehicleForm } from '../../components/VehicleForm';
import { getVehicleById } from '../../lib/vehiclesFetchers';

interface EditVehiclePageProps {
  params: { slug: string };
}

// Dynamic route for editing a vehicle. Fetches existing data for form.
export default async function EditVehiclePage({ params }: EditVehiclePageProps) {
  const { slug } = params;
  const vehicle = await getVehicleById({ id: slug });
  if (!vehicle) {
    notFound();
  }
  // Render the vehicle form pre-filled with existing data
  return <VehicleForm initialData={vehicle} />;
}
