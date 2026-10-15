export function IftaSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading IFTA data" className="space-y-6 p-6">
      <div className="space-y-2">
        <div className="bg-muted h-3 w-56 animate-pulse rounded" />
        <div className="bg-muted h-8 w-72 animate-pulse rounded" />
        <div className="bg-muted h-4 w-full max-w-xl animate-pulse rounded" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div className="bg-muted/40 h-24 animate-pulse rounded-lg border" key={item} />
        ))}
      </div>
      <div className="space-y-3 rounded-lg border p-5">
        {[1, 2, 3, 4].map((item) => (
          <div className="bg-muted/50 h-10 animate-pulse rounded" key={item} />
        ))}
      </div>
    </main>
  );
}
