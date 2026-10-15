import { notFound } from "next/navigation";
import { getExpense } from "@/lib/fetchers/invoicingFetchers";
import { InvoicingExpenseDetailTemplate } from "@/components/templates/invoicingExpenseDetailTemplate";
export async function ExpenseFeature({ expenseId }: { expenseId: string }) {
  const expense = await getExpense(expenseId);
  if (!expense) notFound();
  return <InvoicingExpenseDetailTemplate expense={expense} />;
}
