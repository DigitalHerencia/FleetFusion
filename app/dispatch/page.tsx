import type { Load } from '@prisma/client';

import { DispatchBoard } from './components/DispatchBoard';
import { DispatchBulkActions } from './components/DispatchBulkActions';
import { DispatchFilters } from './components/DispatchFilters';
import { DispatchHeader } from './components/DispatchHeader';
import { getAllLoads } from './lib/dispatchFetchers';

const statuses = [
  'DRAFT',
  'PLANNED',
  'ASSIGNED',
  'AT_PICKUP',
  'IN_TRANSIT',
  'AT_DROPOFF',
  'DELIVERED',
  'CANCELED',
];

export default async function DispatchPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const query = await searchParams;
  const loads = (await getAllLoads({
    status: query.status,
    search: query.search,
    page: 1,
    pageSize: 100,
  })) as Load[];
  const columns = statuses.map((status) => ({
    status,
    loads: loads.filter((load) => load.status === status),
  }));
  const activeLoads = loads.filter(
    (load) => !['DELIVERED', 'CANCELED'].includes(load.status),
  ).length;
  return (
    <main className="domain-page">
      <DispatchHeader activeLoads={activeLoads} />
      <DispatchFilters status={query.status} search={query.search} />
      <DispatchBulkActions loadIds={loads.map((load) => load.id)} />
      <DispatchBoard data={{ columns }} />
    </main>
  );
}
