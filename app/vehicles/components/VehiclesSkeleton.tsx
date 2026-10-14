/**
 * VehiclesSkeleton renders placeholder cards to indicate loading state.
 */
export function VehiclesSkeleton() {
  // Render a few skeleton blocks resembling vehicle cards
  return (
    <div className="space-y-2 p-6">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="animate-pulse rounded-md border p-4 shadow-sm">
          <div className="bg-muted/50 mb-2 h-4 w-1/3 rounded"></div>
          <div className="bg-muted/50 mb-3 h-6 w-2/3 rounded"></div>
          <div className="bg-muted/50 h-4 w-1/2 rounded"></div>
        </div>
      ))}
    </div>
  );
}
