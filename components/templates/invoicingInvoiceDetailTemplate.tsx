import type { ReactNode } from "react";
import Link from "next/link";
import type { InvoiceDTO } from "@/types/invoicingTypes";
import { DashboardTable } from "@/components/blocks/dashboard-layout";
export function InvoicingInvoiceDetailTemplate({
  invoice,
  children,
}: {
  invoice: InvoiceDTO;
  children?: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-5xl space-y-8 surface-card p-6">
      <header className="flex flex-wrap justify-between gap-5 border-b border-border pb-6">
        <div>
          <p className="type-caption">INVOICE</p>
          <h1 className="type-title">#{invoice.number}</h1>
          <p>{invoice.status}</p>
        </div>
        <div>
          <p>Issued: {invoice.issuedAt?.slice(0, 10) ?? "Not dated"}</p>
          <p>Due: {invoice.dueAt?.slice(0, 10) ?? "Not dated"}</p>
          {invoice.status === "DRAFT" && !invoice.approvedAt && (
            <Link className="type-link" href={`/invoices/${invoice.id}/edit`}>
              Edit draft
            </Link>
          )}
        </div>
      </header>
      <section>
        <h2 className="type-label">Bill to</h2>
        <p className="mt-2 text-xl">{invoice.customerName}</p>
        <p>{invoice.customerEmail}</p>
      </section>
      <DashboardTable
        columns={[
          { key: "description", label: "Description" },
          { key: "quantity", label: "Quantity" },
          { key: "price", label: "Unit price" },
          { key: "tax", label: "Tax" },
          { key: "total", label: "Line total" },
        ]}
        rows={invoice.lines.map((line) => ({
          id: line.id,
          cells: {
            description: line.description,
            quantity: line.quantity,
            price: line.unitPrice,
            tax: line.lineTax,
            total: line.lineTotal,
          },
        }))}
      />
      <dl className="ml-auto grid max-w-sm grid-cols-2 gap-3 text-right">
        <dt>Subtotal</dt>
        <dd>{invoice.subtotal}</dd>
        <dt>Tax</dt>
        <dd>{invoice.taxTotal}</dd>
        <dt className="type-title">Total</dt>
        <dd className="type-title">
          {invoice.total} {invoice.currency}
        </dd>
      </dl>
      {children}
    </article>
  );
}
