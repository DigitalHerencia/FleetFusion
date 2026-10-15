import { Suspense } from "react";

import { ExpenseFeature } from "@/features/invoicing/expenseFeature";
import { ExpenseSkeleton } from "@/features/invoicing/expenseSkeleton";

export default async function Page({
  params,
}: {
  params: Promise<{ expenseId: string }>;
}) {
  const { expenseId } = await params;
  return (
    <Suspense fallback={<ExpenseSkeleton />}>
      <ExpenseFeature expenseId={expenseId} />
    </Suspense>
  );
}
