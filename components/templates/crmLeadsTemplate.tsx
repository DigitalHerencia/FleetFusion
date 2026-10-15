import Link from "next/link";
import type { ReactNode } from "react";
import type { CrmContactDTO } from "@/types/crmTypes";
import { DashboardLayout } from "@/components/blocks/dashboard-layout";
export function CrmLeadsTemplate({
  contacts,
  toolbar,
}: {
  contacts: CrmContactDTO[];
  toolbar: ReactNode;
  lead?: boolean;
}) {
  return (
    <DashboardLayout
      title="Lead qualification queue"
      nav={[]}
      toolbar={toolbar}
    >
      <p>
        Review new relationships, reach out, and update qualified leads to
        Active.
      </p>
      <div className="space-y-3">
        {contacts.map((contact) => (
          <article
            key={contact.id}
            className="grid gap-4 surface-card p-5 md:grid-cols-[1fr_1fr_auto]"
          >
            <div>
              <Link
                className="type-label hover:underline"
                href={`/crm/leads/${contact.id}`}
              >
                {contact.firstName} {contact.lastName}
              </Link>
              <p>{contact.title ?? "Role not recorded"}</p>
              <p className="text-sm text-muted-primary">
                Added {contact.createdAt.slice(0, 10)}
              </p>
            </div>
            <div>
              {contact.email ? (
                <a className="type-link" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              ) : (
                <p>Email needed</p>
              )}
              <p>{contact.phone ?? "Phone not recorded"}</p>
              <p>{contact.account?.name ?? "No account linked"}</p>
            </div>
            <Link className="type-link" href={`/crm/leads/${contact.id}/edit`}>
              Review and qualify
            </Link>
          </article>
        ))}
      </div>
      {!contacts.length && <p>No leads awaiting qualification.</p>}
    </DashboardLayout>
  );
}
