import Link from "next/link";
import type { ExpenseDTO } from "@/types/invoicingTypes";
export function InvoicingExpenseDetailTemplate({
  expense,
}: {
  expense: ExpenseDTO;
}) {
  return (
    <article className="mx-auto max-w-3xl space-y-6 surface-card p-6">
      <header>
        <p className="type-caption">EXPENSE</p>
        <h1 className="type-title">{expense.vendor}</h1>
        <p className="mt-4 text-3xl">
          {expense.amount} {expense.currency}
        </p>
      </header>
      <dl className="grid grid-cols-2 gap-4">
        <dt>Incurred</dt>
        <dd>{expense.incurredAt.slice(0, 10)}</dd>
        <dt>Submitted by</dt>
        <dd>{expense.submitter ?? "Not recorded"}</dd>
        <dt>Review status</dt>
        <dd>{expense.status}</dd>
      </dl>
      <section>
        <h2 className="type-label">Business purpose</h2>
        <p className="mt-3 whitespace-pre-wrap">
          {expense.description ?? "Not recorded"}
        </p>
      </section>
      {["DRAFT", "SUBMITTED"].includes(expense.status) && (
        <Link className="type-link" href={`/expenses/${expense.id}/edit`}>
          Edit expense
        </Link>
      )}
    </article>
  );
}
