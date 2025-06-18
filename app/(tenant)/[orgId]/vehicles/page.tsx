import { Suspense } from 'react';

import { listVehiclesByOrg } from '@/lib/fetchers/vehicleFetchers';
import VehicleListClient from '@/features/vehicles/components/vehicle-list-client';
import type { Vehicle as BaseVehicle } from '@/types/vehicles';

// Cache control for auth-required dynamic pages
export const dynamic = 'force-dynamic';

// Define the complete vehicle type with required fields
interface CompleteVehicle extends BaseVehicle {
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  unitNumber: string;
}

export default async function VehiclesPage({
  params,
}: {
  params: Promise<{ orgId: string; userId?: string }>;
}) {
  const { orgId, userId } = await params;
  const vehicles = await listVehiclesByOrg(orgId);

  // Filter and type assert the vehicles to ensure they have all required fields
  const validVehicles = vehicles.vehicles.filter((v): v is CompleteVehicle => {
    return (
      typeof v.unitNumber === 'string' &&
      v.unitNumber !== '' &&
      typeof v.organizationId === 'string' &&
      v.createdAt instanceof Date &&
      v.updatedAt instanceof Date
    );
  });

  return (
    <Suspense>
      <VehicleListClient orgId={orgId} initialVehicles={validVehicles} />
    </Suspense>
  );
}
