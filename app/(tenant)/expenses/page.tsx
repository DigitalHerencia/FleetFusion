import { Suspense } from "react";

import { ExpensesFeature } from "@/features/invoicing/expensesFeature";
import { ExpensesSkeleton } from "@/features/invoicing/expensesSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<ExpensesSkeleton />}>
      <ExpensesFeature />
    </Suspense>
  );
}
