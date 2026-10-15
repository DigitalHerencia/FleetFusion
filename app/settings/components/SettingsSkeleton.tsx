export function SettingsSkeleton() {
  return (
    <div aria-label="Loading settings" aria-busy="true" className="grid gap-5">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
      <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}
