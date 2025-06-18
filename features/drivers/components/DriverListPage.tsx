import Link from 'next/link';
import { Plus } from 'lucide-react';

import { listDriversByOrg } from '@/lib/fetchers/driverFetchers';
import { DriverCard } from '@/components/drivers/driver-card';
import { AddDriverDialog } from '@/features/drivers/components/AddDriverDialog';
import { Button } from '@/components/ui/button';
import type { DriverFilters } from '@/types/drivers';

interface DriverListPageProps {
  orgId: string;
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function DriverListPage({
  orgId,
  searchParams,
}: DriverListPageProps) {
  const filters: DriverFilters = {
    page: searchParams?.page ? Number(searchParams.page) : 1,
    limit: searchParams?.limit ? Number(searchParams.limit) : 20,
  };
  if (typeof searchParams?.q === 'string') {
    filters.search = searchParams.q;
  }

  const { drivers } = await listDriversByOrg(orgId, filters);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Drivers</h1>
          <p className="text-muted-foreground">
            Manage your fleet drivers and their information
          </p>
        </div>
        <AddDriverDialog orgId={orgId} />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drivers.map(driver => (
          <Link
            key={driver.id}
            href={`/${orgId}/drivers/${driver.id}`}
            className="block"
          >
            <DriverCard
              driver={{
                id: driver.id ?? '',
                firstName: driver.firstName ?? '',
                lastName: driver.lastName ?? '',
                email: driver.email ?? '',
                phone: driver.phone ?? '',
                status: driver.status ?? '',
                licenseState: driver.cdlState ?? '',
                licenseExpiration:
                  driver.cdlExpiration != null
                    ? new Date(driver.cdlExpiration)
                    : new Date(0),
                medicalCardExpiration:
                  driver.medicalCardExpiration != null
                    ? new Date(driver.medicalCardExpiration)
                    : new Date(0),
                hireDate:
                  driver.hireDate != null
                    ? new Date(driver.hireDate)
                    : new Date(0),
              }}
              onClick={() => {}}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
