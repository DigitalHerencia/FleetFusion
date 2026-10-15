import type { ReactNode } from "react";
import type { ExpenseDTO } from "@/types/invoicingTypes";
import {
  DashboardLayout,
  DashboardTable,
} from "@/components/blocks/dashboard-layout";
export function InvoicingExpensesTemplate({
  expenses,
  toolbar,
}: {
  expenses: ExpenseDTO[];
  toolbar: ReactNode;
}) {
  return (
    <DashboardLayout title="Expense ledger" nav={[]} toolbar={toolbar}>
      <DashboardTable
        columns={[
          { key: "vendor", label: "Vendor" },
          { key: "purpose", label: "Business purpose" },
          { key: "amount", label: "Amount" },
          { key: "date", label: "Incurred" },
          { key: "submitter", label: "Submitted by" },
          { key: "review", label: "Review status" },
        ]}
        rows={expenses.map((expense) => ({
          id: expense.id,
          href: `/expenses/${expense.id}`,
          cells: {
            vendor: expense.vendor,
            purpose: expense.description,
            amount: `${expense.amount} ${expense.currency}`,
            date: expense.incurredAt.slice(0, 10),
            submitter: expense.submitter,
            review: expense.status,
          },
        }))}
      />
    </DashboardLayout>
  );
}
