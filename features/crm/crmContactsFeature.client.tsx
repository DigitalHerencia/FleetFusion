"use client";
import Link from "next/link";
import { useState } from "react";
import { CrmLeadsTemplate } from "@/components/templates/crmLeadsTemplate";
import { CrmContactsTemplate } from "@/components/templates/crmContactsTemplate";
import { Input } from "@/components/ui/input";
import type { CrmContactDTO } from "@/types/crmTypes";
export function CrmContactsFeatureClient({
  contacts,
  lead = false,
}: {
  contacts: CrmContactDTO[];
  lead?: boolean;
}) {
  const [query, setQuery] = useState("");
  const Template = lead ? CrmLeadsTemplate : CrmContactsTemplate;
  return (
    <Template
      lead={lead}
      contacts={contacts.filter((contact) =>
        `${contact.firstName} ${contact.lastName} ${contact.email ?? ""} ${contact.account?.name ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )}
      toolbar={
        <div className="flex flex-wrap gap-3">
          <Input
            aria-label="Search contacts"
            placeholder="Search person, email or account"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Link
            className="type-link"
            href={`/crm/${lead ? "leads" : "contacts"}/new`}
          >
            Add {lead ? "lead" : "contact"}
          </Link>
        </div>
      }
    />
  );
}
