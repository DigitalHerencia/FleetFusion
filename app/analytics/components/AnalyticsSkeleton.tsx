export function AnalyticsSkeleton() {
  return (
    <div aria-label="Loading analytics" aria-busy="true" className="animate-pulse space-y-5">
      <div className="bg-muted h-8 w-64 rounded" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="bg-muted/50 h-28 rounded-lg border" key={index} />
        ))}
      </div>
      <div className="bg-muted/50 h-72 rounded-lg border" />
    </div>
  );
}
