import type { ReactNode } from "react";
export function AiPlaygroundTemplate({
  model,
  children,
  output,
}: {
  model: string;
  children: ReactNode;
  output: ReactNode;
}) {
  return (
    <section className="space-y-5 p-5">
      <header>
        <h1 className="type-title">AI playground</h1>
        <p className="mt-2 text-muted-primary">Model: {model}</p>
      </header>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="surface-card p-5">
          <h2 className="mb-4 type-label">Prompt</h2>
          {children}
        </section>
        <section className="surface-card p-5">
          <h2 className="mb-4 type-label">Generated response</h2>
          {output}
        </section>
      </div>
    </section>
  );
}
