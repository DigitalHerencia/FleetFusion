// Stub for page.tsx
import { notFound } from 'next/navigation';

import { VehicleDetailClient } from '../components/VehicleDetailClient';
import { getVehicleById } from '../lib/vehiclesFetchers';

interface VehicleDetailPageProps {
  params: { slug: string };
}

// Dynamic route for vehicle detail. Uses Next.js 15 async params pattern.
export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { slug } = params;
  // Fetch vehicle details (including related records)
  const vehicle = await getVehicleById({ id: slug });
  if (!vehicle) {
    // If vehicle not found (or soft-deleted), return 404
    notFound();
  }
  // Render a detail view (client component handles interactive parts if any)
  return <VehicleDetailClient vehicle={vehicle} />;
}
