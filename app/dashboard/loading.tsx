import { DashboardSkeleton } from './components/DashboardSkeleton';

export default function DashboardLoading() {
  return (
    <main className="domain-page">
      <h1>Loading dashboard…</h1>
      <DashboardSkeleton />
    </main>
  );
}
