import { notFound } from 'next/navigation';

import { VehicleDetailClient } from '../components/VehicleDetailClient';
import { getVehicleById } from '../lib/vehiclesFetchers';

interface VehicleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { slug } = await params;
  const vehicle = await getVehicleById({ id: slug });
  if (!vehicle) {
    notFound();
  }
  return <VehicleDetailClient vehicle={vehicle} />;
}
