import Link from "next/link";
import type { ReactNode } from "react";
import type { CrmDealSummaryDTO } from "@/types/crmTypes";
import { CrmDealStage } from "@/schemas/crmSchemas";
import {
  DashboardLayout,
  DashboardPanel,
} from "@/components/blocks/dashboard-layout";

export function CrmPipelineTemplate({
  deals,
  toolbar,
  renderControls,
}: {
  deals: readonly CrmDealSummaryDTO[];
  toolbar: ReactNode;
  renderControls: (deal: CrmDealSummaryDTO) => ReactNode;
}) {
  return (
    <DashboardLayout title="Sales pipeline" nav={[]} toolbar={toolbar}>
      <p className="text-muted-primary">
        Move opportunities through qualification, proposal, negotiation, and
        close. Showing up to 100 opportunities.
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.values(CrmDealStage).map((stage) => {
          const items = deals.filter((deal) => deal.stage === stage);
          return (
            <DashboardPanel
              key={stage}
              title={`${stage.replaceAll("_", " ")} · ${items.length}`}
            >
              <div className="space-y-3">
                {items.map((deal) => (
                  <article
                    key={deal.id}
                    className="space-y-3 surface-inset p-4"
                  >
                    <h3 className="type-label">{deal.name}</h3>
                    <Link
                      className="type-link"
                      href={`/crm/accounts/${deal.account.id}`}
                    >
                      {deal.account.name}
                    </Link>
                    <p className="text-xl">
                      {deal.value} {deal.currency}
                    </p>
                    <dl className="text-sm">
                      <dt>Probability</dt>
                      <dd>{deal.probability}%</dd>
                      <dt>Expected close</dt>
                      <dd>
                        {deal.expectedCloseDate?.slice(0, 10) ?? "Unscheduled"}
                      </dd>
                      <dt>Owner</dt>
                      <dd>{deal.owner?.displayName ?? "Unassigned"}</dd>
                    </dl>
                    {renderControls(deal)}
                  </article>
                ))}
                {items.length === 0 && (
                  <p className="p-3 text-muted-primary">
                    No opportunities in this stage.
                  </p>
                )}
              </div>
            </DashboardPanel>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
