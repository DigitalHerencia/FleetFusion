"use client";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { InvoicingInvoicesTemplate } from "@/components/templates/invoicingInvoicesTemplate";
import type { InvoiceDTO } from "@/types/invoicingTypes";
export function InvoicesFeatureClient({
  invoices,
}: {
  invoices: InvoiceDTO[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  return (
    <InvoicingInvoicesTemplate
      invoices={invoices.filter(
        (invoice) =>
          (!status || invoice.status === status) &&
          `${invoice.number} ${invoice.customerName}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      )}
      toolbar={
        <div className="flex flex-wrap gap-3">
          <Input
            aria-label="Search invoices"
            placeholder="Search invoice or customer"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="control-field"
            aria-label="Invoice status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            {[...new Set(invoices.map((invoice) => invoice.status))].map(
              (value) => (
                <option key={value}>{value}</option>
              ),
            )}
          </select>
          <Link className="type-link" href="/invoices/new">
            Draft invoice
          </Link>
        </div>
      }
    />
  );
}
