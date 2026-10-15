import { DispatchSkeleton } from './components/DispatchSkeleton';

export default function DispatchLoading() {
  return (
    <main className="domain-page">
      <h1>Loading dispatch…</h1>
      <DispatchSkeleton />
    </main>
  );
}
