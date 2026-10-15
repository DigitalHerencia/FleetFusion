import { refreshSystemIndexes } from '../lib/adminActions';
import { getAdminDashboardSnapshot } from '../lib/adminFetchers';

async function refreshStatistics(formData: FormData) {
  'use server';
  void formData;
  await refreshSystemIndexes();
}

export default async function AdminDatabasePage() {
  const snapshot = await getAdminDashboardSnapshot();
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Database maintenance</h1>
        <p className="text-muted-foreground mt-2">
          Check database connectivity and refresh PostgreSQL planner statistics.
        </p>
      </header>
      <div className="rounded-lg border p-5">
        <h2 className="font-semibold">Planner statistics</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          ANALYZE updates table statistics used by the query planner. It does not rebuild or alter
          application data.
        </p>
        <form action={refreshStatistics} className="mt-4">
          <button className="bg-primary text-primary-foreground rounded-md px-4 py-2" type="submit">
            Refresh statistics
          </button>
        </form>
      </div>
      <p className="text-muted-foreground text-sm">
        Current database status: {snapshot.database.status}
        {snapshot.database.latencyMs !== null ? ` (${snapshot.database.latencyMs} ms)` : ''}
      </p>
    </section>
  );
}
