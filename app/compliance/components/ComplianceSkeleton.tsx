export function ComplianceSkeleton() {
  return (
    <main className="domain-page" aria-busy="true" aria-label="Loading compliance records">
      <div className="skeleton skeleton-heading" />
      <div className="skeleton skeleton-summary" />
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-card" />
    </main>
  );
}
