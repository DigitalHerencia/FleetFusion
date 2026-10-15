import { ExpenseEditForm } from "@/features/invoicing/expenseEditForm";

export default async function Page({
  params,
}: {
  params: Promise<{ expenseId: string }>;
}) {
  const { expenseId } = await params;
  return <ExpenseEditForm expenseId={expenseId} />;
}
