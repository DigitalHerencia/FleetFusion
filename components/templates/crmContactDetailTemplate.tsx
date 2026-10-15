import Link from "next/link";
import type { CrmContactDTO } from "@/types/crmTypes";
import {
  DashboardLayout,
  DashboardPanel,
} from "@/components/blocks/dashboard-layout";
export function CrmContactDetailTemplate({
  contact,
  lead = false,
}: {
  contact: CrmContactDTO;
  lead?: boolean;
}) {
  return (
    <DashboardLayout
      title={`${contact.firstName} ${contact.lastName}`}
      nav={[]}
      toolbar={
        <Link
          className="type-link"
          href={`/crm/${lead ? "leads" : "contacts"}/${contact.id}/edit`}
        >
          {lead ? "Qualify or edit lead" : "Edit contact"}
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <DashboardPanel title="Contact profile">
          <p className="text-xl">{contact.title ?? "Job title not recorded"}</p>
          <div className="mt-5 space-y-3">
            {contact.email && (
              <p>
                <a className="type-link" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </p>
            )}
            {contact.phone && (
              <p>
                <a className="type-link" href={`tel:${contact.phone}`}>
                  {contact.phone}
                </a>
              </p>
            )}
            <p>
              {contact.account ? (
                <Link
                  className="type-link"
                  href={`/crm/accounts/${contact.account.id}`}
                >
                  {contact.account.name}
                </Link>
              ) : (
                "No account linked"
              )}
            </p>
          </div>
        </DashboardPanel>
        <DashboardPanel title="Relationship">
          <dl className="space-y-2">
            <dt>Status</dt>
            <dd>{contact.status}</dd>
            <dt>Relationship owner</dt>
            <dd>{contact.owner?.displayName ?? "Unassigned"}</dd>
            <dt>Added</dt>
            <dd>{contact.createdAt.slice(0, 10)}</dd>
            <dt>Last updated</dt>
            <dd>{contact.updatedAt.slice(0, 10)}</dd>
          </dl>
        </DashboardPanel>
      </div>
    </DashboardLayout>
  );
}
