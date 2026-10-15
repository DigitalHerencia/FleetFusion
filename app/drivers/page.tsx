import type { Driver } from '@prisma/client';

import { DriversBulkActions } from './components/DriversBulkActions';
import { DriversFilters } from './components/DriversFilters';
import { DriversHeader } from './components/DriversHeader';
import { DriversList } from './components/DriversList';
import { getAllDrivers } from './lib/driversFetchers';

export default async function DriversPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const query = await searchParams;
  const drivers = (await getAllDrivers({
    status: query.status,
    search: query.search,
    page: 1,
    pageSize: 100,
  })) as Driver[];
  const active = drivers.filter((driver) => driver.status === 'ACTIVE').length;
  return (
    <main className="domain-page">
      <DriversHeader total={drivers.length} active={active} />
      <DriversFilters status={query.status} search={query.search} />
      <DriversBulkActions
        drivers={drivers.map(({ id, firstName, lastName }) => ({ id, firstName, lastName }))}
      />
      <DriversList drivers={drivers} />
    </main>
  );
}
