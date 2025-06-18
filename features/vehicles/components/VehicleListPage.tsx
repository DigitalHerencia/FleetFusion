import { Suspense } from 'react';

import { listVehiclesByOrg } from '@/lib/fetchers/vehicleFetchers';
import VehicleListClient from './vehicle-list-client';

interface VehicleListPageProps {
  orgId: string;
  page?: number;
}

export default async function VehicleListPage({
  orgId,
  page = 1,
}: VehicleListPageProps) {
  const { vehicles } = await listVehiclesByOrg(orgId, {
    page,
    limit: 0,
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fleet Vehicles</h1>
          <p className="text-muted-foreground">Manage your fleet vehicles and their information</p>
        </div>
      </div>
      
      <Suspense fallback={<div>Loading vehicles...</div>}>
        <VehicleListClient orgId={orgId} initialVehicles={vehicles} />
      </Suspense>
    </div>
  );
}
