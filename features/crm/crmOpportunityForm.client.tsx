"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCrmDeal } from "@/lib/actions/crmActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CrmAccountDTO } from "@/types/crmTypes";
export function CrmOpportunityForm({
  accounts,
}: {
  accounts: CrmAccountDTO[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <details className="mx-4 my-3 surface-card p-4">
      <summary className="cursor-pointer type-label">
        Create opportunity
      </summary>
      <form
        className="mt-4 grid gap-4 sm:grid-cols-2"
        action={(data) =>
          startTransition(async () => {
            try {
              await createCrmDeal({
                name: data.get("name"),
                accountId: data.get("accountId"),
                value: data.get("value"),
                currency: data.get("currency"),
                probability: Number(data.get("probability")),
                expectedCloseDate: data.get("close") || null,
              });
              setMessage("Opportunity created in Lead.");
              router.refresh();
            } catch {
              setMessage(
                "Opportunity could not be saved. Check amounts, account, and permissions.",
              );
            }
          })
        }
      >
        <div className="form-field">
          <Label htmlFor="deal-name">Opportunity name</Label>
          <Input id="deal-name" name="name" required maxLength={200} />
        </div>
        <div className="form-field">
          <Label htmlFor="deal-account">Account</Label>
          <select
            id="deal-account"
            name="accountId"
            className="control-field"
            required
          >
            <option value="">Choose account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <Label htmlFor="deal-value">Opportunity value</Label>
          <Input
            id="deal-value"
            name="value"
            inputMode="decimal"
            required
            defaultValue="0"
          />
        </div>
        <div className="form-field">
          <Label htmlFor="deal-currency">Currency</Label>
          <Input
            id="deal-currency"
            name="currency"
            required
            minLength={3}
            maxLength={3}
            defaultValue="USD"
          />
        </div>
        <div className="form-field">
          <Label htmlFor="deal-probability">Probability (%)</Label>
          <Input
            id="deal-probability"
            name="probability"
            type="number"
            required
            min={0}
            max={100}
            defaultValue={0}
          />
        </div>
        <div className="form-field">
          <Label htmlFor="deal-close">Expected close</Label>
          <Input id="deal-close" name="close" type="date" />
        </div>
        <Button disabled={pending || !accounts.length} type="submit">
          Create opportunity
        </Button>
        <p role="status">{message}</p>
        {!accounts.length && (
          <p>Create an account before adding an opportunity.</p>
        )}
      </form>
    </details>
  );
}
