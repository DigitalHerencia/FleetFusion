export function AdminSkeleton() {
  return (
    <div
      aria-label="Loading administration data"
      aria-busy="true"
      className="animate-pulse space-y-5"
    >
      <div className="bg-muted h-8 w-56 rounded" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="bg-muted/50 h-28 rounded-lg border" key={index} />
        ))}
      </div>
      <div className="bg-muted/50 h-64 rounded-lg border" />
    </div>
  );
}
