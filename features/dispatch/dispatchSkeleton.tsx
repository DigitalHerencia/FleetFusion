import { Skeleton } from "@/components/ui/skeleton";

export function DispatchSkeleton() {
  return (
    <section className="space-y-4 p-4" aria-busy="true" aria-label="Loading dispatch board">
      <Skeleton className="h-10 w-48 rounded-none" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton className="h-24 rounded-none" key={index} />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton className="h-72 rounded-none" key={index} />
        ))}
      </div>
      <span className="sr-only">Loading dispatch board…</span>
    </section>
  );
}
