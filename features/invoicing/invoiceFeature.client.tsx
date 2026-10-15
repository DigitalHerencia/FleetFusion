"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveInvoice,
  issueApprovedInvoice,
} from "@/lib/actions/invoicingActions";
import { Button } from "@/components/ui/button";
import type { InvoiceDTO } from "@/types/invoicingTypes";
export function InvoiceFeatureClient({ invoice }: { invoice: InvoiceDTO }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  if (invoice.status !== "DRAFT") return null;
  return (
    <div className="space-y-3">
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              const command = {
                invoiceId: invoice.id,
                expectedVersion: invoice.version,
              };
              if (invoice.approvedAt) await issueApprovedInvoice(command);
              else await approveInvoice(command);
              setMessage("Invoice updated.");
              router.refresh();
            } catch {
              setMessage(
                "Invoice could not be updated. Check permissions and reload the current version.",
              );
            }
          })
        }
      >
        {invoice.approvedAt ? "Issue approved invoice" : "Approve invoice"}
      </Button>
      <p className="text-sm text-muted-primary">
        Issuing records this invoice as open. It does not email the customer or
        charge a payment method.
      </p>
      <p role="status">{message}</p>
    </div>
  );
}
