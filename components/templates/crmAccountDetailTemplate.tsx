import Link from "next/link";
import type { CrmAccountDTO } from "@/types/crmTypes";
import {
  DashboardLayout,
  DashboardPanel,
} from "@/components/blocks/dashboard-layout";
export function CrmAccountDetailTemplate({
  account,
}: {
  account: CrmAccountDTO;
}) {
  return (
    <DashboardLayout
      title={account.name}
      nav={[]}
      toolbar={
        <Link className="type-link" href={`/crm/accounts/${account.id}/edit`}>
          Edit account
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <DashboardPanel title="Relationship notes">
          <p className="whitespace-pre-wrap">
            {account.notes ?? "No notes yet."}
          </p>
        </DashboardPanel>
        <DashboardPanel title="Company profile">
          <dl className="space-y-2">
            <dt>Industry</dt>
            <dd>{account.industry ?? "Not recorded"}</dd>
            <dt>Website</dt>
            <dd>
              {account.website && /^https?:\/\//.test(account.website) ? (
                <a className="type-link" href={account.website}>
                  {account.website}
                </a>
              ) : (
                "Not recorded"
              )}
            </dd>
            <dt>Relationship</dt>
            <dd>{account.status}</dd>
            <dt>Contacts / opportunities</dt>
            <dd>
              {account.contactCount} / {account.dealCount}
            </dd>
          </dl>
        </DashboardPanel>
      </div>
    </DashboardLayout>
  );
}
