import type { ReactNode } from "react";
import type { InvoiceDTO } from "@/types/invoicingTypes";
import {
  DashboardLayout,
  DashboardTable,
} from "@/components/blocks/dashboard-layout";
export function InvoicingInvoicesTemplate({
  invoices,
  toolbar,
}: {
  invoices: InvoiceDTO[];
  toolbar: ReactNode;
}) {
  return (
    <DashboardLayout title="Accounts receivable" nav={[]} toolbar={toolbar}>
      <p>Track customer invoices and due dates. Showing up to 100 invoices.</p>
      <DashboardTable
        columns={[
          { key: "number", label: "Invoice" },
          { key: "customer", label: "Customer" },
          { key: "total", label: "Amount" },
          { key: "status", label: "Payment status" },
          { key: "due", label: "Due date" },
        ]}
        rows={invoices.map((invoice) => ({
          id: invoice.id,
          href: `/invoices/${invoice.id}`,
          cells: {
            number: `#${invoice.number}`,
            customer: invoice.customerName,
            total: `${invoice.total} ${invoice.currency}`,
            status: invoice.status,
            due: invoice.dueAt?.slice(0, 10) ?? "Not set",
          },
        }))}
        emptyLabel="No matching invoices."
      />
    </DashboardLayout>
  );
}
