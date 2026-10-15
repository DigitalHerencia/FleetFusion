export function NotificationSkeleton() {
  return (
    <main className="domain-page" aria-busy="true" aria-label="Loading notifications">
      <div className="skeleton skeleton-heading" />
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-card" />
    </main>
  );
}
