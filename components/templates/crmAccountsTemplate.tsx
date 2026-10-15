import Link from "next/link";
import type { ReactNode } from "react";
import type { CrmAccountDTO } from "@/types/crmTypes";
import { DashboardLayout } from "@/components/blocks/dashboard-layout";
export function CrmAccountsTemplate({
  accounts,
  toolbar,
}: {
  accounts: CrmAccountDTO[];
  toolbar: ReactNode;
}) {
  return (
    <DashboardLayout title="Account relationships" nav={[]} toolbar={toolbar}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((account) => (
          <article key={account.id} className="space-y-3 surface-card p-5">
            <Link
              className="type-title hover:underline"
              href={`/crm/accounts/${account.id}`}
            >
              {account.name}
            </Link>
            <p>
              {account.industry ?? "Industry not recorded"} · {account.status}
            </p>
            <p>
              {account.contactCount} contacts · {account.dealCount}{" "}
              opportunities
            </p>
            <p className="line-clamp-3 text-muted-primary">
              {account.notes ?? "No relationship notes."}
            </p>
          </article>
        ))}
      </div>
      {!accounts.length && <p>No matching accounts.</p>}
    </DashboardLayout>
  );
}
