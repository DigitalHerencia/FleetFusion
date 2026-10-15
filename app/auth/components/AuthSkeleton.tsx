export function AuthSkeleton() {
  return (
    <div aria-label="Loading account" aria-busy="true" className="mx-auto grid max-w-4xl gap-5 p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
      <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}
