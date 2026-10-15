import { getDispatchBoardWorkflow } from "@/lib/workflows/dispatchWorkflows";

// Server shell only. Board UI lands in the next batch.
export async function DispatchFeature() {
  const { columns, unassigned, total } = await getDispatchBoardWorkflow();
  return (
    <section className="space-y-4 p-6">
      <h1 className="text-2xl font-black tracking-tight">Dispatch</h1>
      <p className="text-muted-foreground text-sm">
        {total} active loads, {unassigned} unassigned
      </p>
      <pre className="bg-card overflow-auto rounded-xl border p-4 text-xs">
        {JSON.stringify(
          Object.fromEntries(Object.entries(columns).map(([k, v]) => [k, v.length])),
          null,
          2,
        )}
      </pre>
    </section>
  );
}