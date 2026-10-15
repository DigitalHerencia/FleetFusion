"use client";
import Link from "next/link";
import { useState } from "react";
import { CrmAccountsTemplate } from "@/components/templates/crmAccountsTemplate";
import { Input } from "@/components/ui/input";
import type { CrmAccountDTO } from "@/types/crmTypes";
export function CrmAccountsFeatureClient({
  accounts,
}: {
  accounts: CrmAccountDTO[];
}) {
  const [query, setQuery] = useState("");
  return (
    <CrmAccountsTemplate
      accounts={accounts.filter((account) =>
        `${account.name} ${account.industry ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )}
      toolbar={
        <div className="flex flex-wrap gap-3">
          <Input
            aria-label="Search accounts"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search company or industry"
          />
          <Link className="type-link" href="/crm/accounts/new">
            New account
          </Link>
        </div>
      }
    />
  );
}
