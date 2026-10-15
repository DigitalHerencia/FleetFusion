"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { createInvoice, updateInvoice } from "@/lib/actions/invoicingActions";
import type { InvoiceDTO } from "@/types/invoicingTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
interface Values {
  customerName: string;
  customerEmail: string;
  currency: string;
  issuedAt: string;
  dueAt: string;
  lines: {
    description: string;
    quantity: string;
    unitPrice: string;
    taxRate: string;
  }[];
}
export function InvoiceNewForm({ invoice }: { invoice?: InvoiceDTO }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<Values>({
    defaultValues: {
      customerName: invoice?.customerName ?? "",
      customerEmail: invoice?.customerEmail ?? "",
      currency: invoice?.currency ?? "USD",
      issuedAt: invoice?.issuedAt?.slice(0, 10) ?? "",
      dueAt: invoice?.dueAt?.slice(0, 10) ?? "",
      lines: invoice?.lines.map((line) => ({
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRate: line.taxRate,
      })) ?? [{ description: "", quantity: "1", unitPrice: "0", taxRate: "0" }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const locked = Boolean(
    invoice && (invoice.status !== "DRAFT" || invoice.approvedAt),
  );
  return (
    <form
      className="mx-auto max-w-5xl space-y-5 surface-card p-5"
      onSubmit={handleSubmit(async (values) => {
        setError("");
        try {
          const input = {
            ...values,
            customerEmail: values.customerEmail || null,
            issuedAt: values.issuedAt || null,
            dueAt: values.dueAt || null,
          };
          const saved = invoice
            ? await updateInvoice({
                ...input,
                invoiceId: invoice.id,
                expectedVersion: invoice.version,
              })
            : await createInvoice(input);
          router.push(`/invoices/${saved.id}`);
          router.refresh();
        } catch {
          setError(
            "Invoice could not be saved. Check line amounts, permissions, or reload the current draft.",
          );
        }
      })}
    >
      <h1 className="type-title">
        {invoice ? `Edit invoice #${invoice.number}` : "Draft an invoice"}
      </h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            "customerName",
            "customerEmail",
            "currency",
            "issuedAt",
            "dueAt",
          ] as const
        ).map((field) => (
          <div className="form-field" key={field}>
            <Label htmlFor={`invoice-${field}`}>
              {
                {
                  customerName: "Customer name",
                  customerEmail: "Customer email",
                  currency: "Currency (ISO code)",
                  issuedAt: "Issue date",
                  dueAt: "Due date",
                }[field]
              }
            </Label>
            <Input
              id={`invoice-${field}`}
              required={field === "customerName" || field === "currency"}
              type={
                field.endsWith("At")
                  ? "date"
                  : field === "customerEmail"
                    ? "email"
                    : "text"
              }
              {...register(field)}
            />
          </div>
        ))}
      </div>
      <fieldset className="space-y-3">
        <legend className="type-label">Line items</legend>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid gap-3 surface-inset p-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            {(["description", "quantity", "unitPrice", "taxRate"] as const).map(
              (key) => (
                <div className="form-field" key={key}>
                  <Label htmlFor={`line-${index}-${key}`}>
                    {
                      {
                        description: "Description",
                        quantity: "Quantity",
                        unitPrice: "Unit price",
                        taxRate: "Tax rate (0–1)",
                      }[key]
                    }
                  </Label>
                  <Input
                    id={`line-${index}-${key}`}
                    required
                    inputMode={key === "description" ? "text" : "decimal"}
                    {...register(`lines.${index}.${key}`)}
                  />
                </div>
              ),
            )}
            <Button
              type="button"
              variant="outline"
              disabled={fields.length === 1}
              onClick={() => remove(index)}
            >
              Remove line {index + 1}
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          disabled={fields.length >= 500}
          onClick={() =>
            append({
              description: "",
              quantity: "1",
              unitPrice: "0",
              taxRate: "0",
            })
          }
        >
          Add line
        </Button>
      </fieldset>
      {locked && (
        <p role="alert">Only unapproved draft invoices can be edited.</p>
      )}
      {error && <p role="alert">{error}</p>}
      <Button disabled={isSubmitting || locked} type="submit">
        {isSubmitting ? "Saving…" : "Save draft invoice"}
      </Button>
    </form>
  );
}
