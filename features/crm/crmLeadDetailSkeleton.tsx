import { Skeleton } from "@/components/ui/skeleton";

export function CrmLeadDetailSkeleton() {
  return (
    <div
      aria-label="Loading /crm/leads/[leadId]"
      className="grid min-h-[42rem] animate-pulse border border-border lg:grid-cols-[11rem_minmax(0,1fr)_14rem]"
      role="status"
    >
      <Skeleton className="hidden rounded-none border-r border-border lg:block" />
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-52 rounded-none" />
        <div className="grid gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton className="h-20 rounded-none" key={index} />
          ))}
        </div>
        <Skeleton className="h-80 rounded-none" />
      </div>
      <Skeleton className="hidden rounded-none border-l border-border lg:block" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
