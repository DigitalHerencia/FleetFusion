"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createExpense, updateExpense } from "@/lib/actions/invoicingActions";
import type { ExpenseDTO } from "@/types/invoicingTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function ExpenseNewForm({ expense }: { expense?: ExpenseDTO }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{
    vendor: string;
    description: string;
    amount: string;
    currency: string;
    incurredAt: string;
  }>({
    defaultValues: {
      vendor: expense?.vendor ?? "",
      description: expense?.description ?? "",
      amount: expense?.amount ?? "",
      currency: expense?.currency ?? "USD",
      incurredAt: expense?.incurredAt.slice(0, 10) ?? "",
    },
  });
  return (
    <form
      className="mx-auto max-w-3xl space-y-5 surface-card p-5"
      onSubmit={handleSubmit(async (values) => {
        setError("");
        try {
          const saved = expense
            ? await updateExpense({
                ...values,
                expenseId: expense.id,
                expectedUpdatedAt: expense.updatedAt,
              })
            : await createExpense(values);
          router.push(`/expenses/${saved.id}`);
          router.refresh();
        } catch {
          setError(
            "Expense could not be saved. Check fields, access, or whether this expense has already been reviewed.",
          );
        }
      })}
    >
      <h1 className="type-title">
        {expense ? "Edit expense" : "Submit expense"}
      </h1>
      {(
        ["vendor", "description", "amount", "currency", "incurredAt"] as const
      ).map((field) => (
        <div className="form-field" key={field}>
          <Label htmlFor={`expense-${field}`}>
            {
              {
                vendor: "Vendor",
                description: "Business purpose",
                amount: "Amount",
                currency: "Currency (ISO code)",
                incurredAt: "Expense date",
              }[field]
            }
          </Label>
          <Input
            id={`expense-${field}`}
            required={field !== "description"}
            type={field === "incurredAt" ? "date" : "text"}
            inputMode={field === "amount" ? "decimal" : "text"}
            {...register(field)}
          />
        </div>
      ))}
      {error && <p role="alert">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save expense"}
      </Button>
    </form>
  );
}
