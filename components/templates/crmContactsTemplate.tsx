import Link from "next/link";
import type { ReactNode } from "react";
import type { CrmContactDTO } from "@/types/crmTypes";
import {
  DashboardLayout,
  DashboardTable,
} from "@/components/blocks/dashboard-layout";
export function CrmContactsTemplate({
  contacts,
  toolbar,
  lead = false,
}: {
  contacts: CrmContactDTO[];
  toolbar: ReactNode;
  lead?: boolean;
}) {
  return (
    <DashboardLayout
      title={lead ? "Lead qualification" : "Contact directory"}
      nav={[]}
      toolbar={toolbar}
    >
      <p className="text-muted-primary">
        {lead
          ? "Review prospective customers and qualify their relationship."
          : "Find people, their accounts, and the best way to reach them."}{" "}
        Showing up to 100 contacts.
      </p>
      <DashboardTable
        columns={[
          { key: "person", label: "Person" },
          { key: "role", label: "Job title" },
          { key: "account", label: "Account" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "status", label: "Relationship" },
        ]}
        rows={contacts.map((contact) => ({
          id: contact.id,
          href: `/crm/${lead ? "leads" : "contacts"}/${contact.id}`,
          cells: {
            person: `${contact.firstName} ${contact.lastName}`,
            role: contact.title,
            account: contact.account ? (
              <Link href={`/crm/accounts/${contact.account.id}`}>
                {contact.account.name}
              </Link>
            ) : (
              "Independent"
            ),
            email: contact.email ? (
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            ) : (
              "—"
            ),
            phone: contact.phone,
            status: contact.status,
          },
        }))}
        emptyLabel="No matching contacts."
      />
    </DashboardLayout>
  );
}
