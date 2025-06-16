import { Suspense } from 'react';

import DriverListPage from '@/features/drivers/DriverListPage';

// Cache control for auth-required dynamic pages
export const dynamic = 'force-dynamic';

export default async function DriversPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string; userId?: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { orgId } = await params;
  const sp = searchParams ? await searchParams : undefined;

  return (
    <main className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Drivers</h1>
      <Suspense fallback={<div>Loading drivers...</div>}>
        <DriverListPage orgId={orgId} searchParams={sp} />
      </Suspense>
    </main>
  );
}
