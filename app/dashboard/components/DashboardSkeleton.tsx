export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton" aria-busy="true" aria-label="Loading dashboard">
      {Array.from({ length: 4 }, (_, index) => (
        <div className="skeleton-card" key={index} />
      ))}
      <div className="skeleton-card" />
      <div className="skeleton-card" />
    </div>
  );
}

export default DashboardSkeleton;
