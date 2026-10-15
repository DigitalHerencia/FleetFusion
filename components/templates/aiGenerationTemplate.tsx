import Link from "next/link";
import type { AiGenerationHistoryDTO } from "@/types/aiTypes";
import { DashboardLayout } from "@/components/blocks/dashboard-layout";
export function AiGenerationTemplate({
  generations,
}: {
  generations: AiGenerationHistoryDTO[];
}) {
  return (
    <DashboardLayout
      title="Generation history"
      nav={[]}
      toolbar={
        <Link className="type-link" href="/ai/playground">
          New generation
        </Link>
      }
    >
      <div className="space-y-4">
        {generations.map((generation) => (
          <details key={generation.id} className="surface-card p-5">
            <summary className="cursor-pointer">
              <span className="type-label">
                {generation.prompt?.slice(0, 100) ?? generation.model}
              </span>
              <span className="mt-2 block text-sm text-muted-primary">
                {generation.status} · {generation.model} ·{" "}
                {generation.createdAt.slice(0, 16).replace("T", " ")}
              </span>
            </summary>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <section>
                <h2 className="type-label">Prompt</h2>
                <p className="mt-3 whitespace-pre-wrap">
                  {generation.prompt ?? "No text prompt was recorded."}
                </p>
              </section>
              <section>
                <h2 className="type-label">Saved response</h2>
                <p className="mt-3 whitespace-pre-wrap">
                  {generation.response ?? "No response was recorded."}
                </p>
              </section>
            </div>
          </details>
        ))}
      </div>
      {!generations.length && <p>No generations yet.</p>}
    </DashboardLayout>
  );
}
