import type { CrmDealSummaryDTO } from "@/types/crmTypes";
import {
  DashboardLayout,
  DashboardPanel,
  DashboardTable,
} from "@/components/blocks/dashboard-layout";
export function CrmAnalyticsTemplate({
  deals,
}: {
  deals: CrmDealSummaryDTO[];
}) {
  const currencies = [...new Set(deals.map((deal) => deal.currency))];
  return (
    <DashboardLayout title="Pipeline analysis" nav={[]}>
      <p>
        Analysis of the latest {deals.length} opportunities (maximum 100).
        Values are kept separate by currency.
      </p>
      {currencies.map((currency) => (
        <DashboardPanel key={currency} title={currency}>
          <DashboardTable
            columns={[
              { key: "stage", label: "Sales stage" },
              { key: "count", label: "Opportunities" },
              { key: "value", label: "Pipeline value" },
              { key: "weighted", label: "Probability-weighted value" },
            ]}
            rows={[
              "LEAD",
              "QUALIFIED",
              "PROPOSAL",
              "NEGOTIATION",
              "WON",
              "LOST",
            ].map((stage) => {
              const group = deals.filter(
                (deal) => deal.currency === currency && deal.stage === stage,
              );
              return {
                id: stage,
                cells: {
                  stage,
                  count: group.length,
                  value: group
                    .reduce((sum, deal) => sum + Number(deal.value), 0)
                    .toFixed(2),
                  weighted: group
                    .reduce(
                      (sum, deal) =>
                        sum + (Number(deal.value) * deal.probability) / 100,
                      0,
                    )
                    .toFixed(2),
                },
              };
            })}
          />
        </DashboardPanel>
      ))}
      {!deals.length && <p>No opportunities available for analysis.</p>}
    </DashboardLayout>
  );
}
