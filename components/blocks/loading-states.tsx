export function DataTableLoadingState({ rows = 6 }: { rows?: number }) {
  return (
    <div
      aria-label="Loading records"
      role="status"
      className="space-y-3 border-3 border-foreground bg-card p-4"
    >
      <div className="h-11 animate-pulse bg-muted" />
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="grid grid-cols-4 gap-3 border-t border-border pt-3"
        >
          <span className="h-5 animate-pulse bg-muted" />
          <span className="h-5 animate-pulse bg-muted" />
          <span className="h-5 animate-pulse bg-muted" />
          <span className="h-5 animate-pulse bg-muted" />
        </div>
      ))}
      <span className="sr-only">Loading records</span>
    </div>
  );
}

export function RecordDetailLoadingState() {
  return (
    <div
      aria-label="Loading record"
      role="status"
      className="space-y-6 border-3 border-foreground bg-card p-6"
    >
      <div className="h-8 w-2/3 animate-pulse bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-2 border-l-3 border-primary pl-3">
            <span className="block h-3 w-20 animate-pulse bg-muted" />
            <span className="block h-5 w-32 animate-pulse bg-muted" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading record</span>
    </div>
  );
}
