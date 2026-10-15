"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createCrmAccount, updateCrmAccount } from "@/lib/actions/crmActions";
import type { CrmAccountDTO } from "@/types/crmTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
interface Values {
  name: string;
  website: string;
  industry: string;
  notes: string;
}
export function CrmNewAccountForm({ account }: { account?: CrmAccountDTO }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Values>({
    defaultValues: {
      name: account?.name ?? "",
      website: account?.website ?? "",
      industry: account?.industry ?? "",
      notes: account?.notes ?? "",
    },
  });
  return (
    <form
      className="mx-auto max-w-3xl space-y-5 surface-card p-5"
      onSubmit={handleSubmit(async (values) => {
        setError("");
        try {
          const saved = account
            ? await updateCrmAccount({
                ...values,
                accountId: account.id,
                expectedUpdatedAt: account.updatedAt,
              })
            : await createCrmAccount(values);
          router.push(`/crm/accounts/${saved.id}`);
          router.refresh();
        } catch {
          setError(
            "Account could not be saved. Check fields and access, or reload if the record has changed.",
          );
        }
      })}
    >
      <h1 className="type-title">{account ? "Edit account" : "New account"}</h1>
      {(["name", "website", "industry"] as const).map((field) => (
        <div className="form-field" key={field}>
          <Label htmlFor={`account-${field}`}>
            {
              {
                name: "Company name",
                website: "Website",
                industry: "Industry",
              }[field]
            }
          </Label>
          <Input
            id={`account-${field}`}
            required={field === "name"}
            type={field === "website" ? "url" : "text"}
            {...register(field)}
          />
        </div>
      ))}
      <div className="form-field">
        <Label htmlFor="account-notes">Relationship notes</Label>
        <textarea
          id="account-notes"
          className="control-field min-h-36"
          {...register("notes")}
        />
      </div>
      {error && <p role="alert">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save account"}
      </Button>
    </form>
  );
}
