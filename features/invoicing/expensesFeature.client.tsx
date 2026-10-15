"use client";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { InvoicingExpensesTemplate } from "@/components/templates/invoicingExpensesTemplate";
import type { ExpenseDTO } from "@/types/invoicingTypes";
export function ExpensesFeatureClient({
  expenses,
}: {
  expenses: ExpenseDTO[];
}) {
  const [query, setQuery] = useState("");
  return (
    <InvoicingExpensesTemplate
      expenses={expenses.filter((expense) =>
        `${expense.vendor} ${expense.description ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )}
      toolbar={
        <div className="flex flex-wrap gap-3">
          <Input
            aria-label="Search expenses"
            placeholder="Search vendor or purpose"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Link className="type-link" href="/expenses/new">
            Submit expense
          </Link>
        </div>
      }
    />
  );
}
