import type { PortalBillingDTO } from "@/types/portalTypes";
import {
  DashboardLayout,
  DashboardPanel,
  DashboardTable,
} from "@/components/blocks/dashboard-layout";
export function PortalBillingTemplate({
  billing,
}: {
  billing: PortalBillingDTO;
}) {
  return (
    <DashboardLayout title="Billing overview" nav={[]}>
      <DashboardPanel title="Subscription">
        {billing.subscription ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            <dt>Plan</dt>
            <dd>{billing.subscription.planKey}</dd>
            <dt>Status</dt>
            <dd>{billing.subscription.status}</dd>
            <dt>Current period ends</dt>
            <dd>
              {billing.subscription.currentPeriodEnd?.slice(0, 10) ??
                "Not recorded"}
            </dd>
            <dt>Renewal</dt>
            <dd>
              {billing.subscription.cancelAtPeriodEnd
                ? "Cancels at period end"
                : "Continues"}
            </dd>
          </dl>
        ) : (
          <p>No subscription is recorded for this workspace.</p>
        )}
      </DashboardPanel>
      <DashboardPanel title="Recent invoices">
        <DashboardTable
          columns={[
            { key: "number", label: "Invoice" },
            { key: "customer", label: "Customer" },
            { key: "amount", label: "Amount" },
            { key: "status", label: "Status" },
            { key: "due", label: "Due" },
          ]}
          rows={billing.invoices.map((invoice) => ({
            id: invoice.id,
            cells: {
              number: `#${invoice.number}`,
              customer: invoice.customerName,
              amount: `${invoice.total} ${invoice.currency}`,
              status: invoice.status,
              due: invoice.dueAt?.slice(0, 10),
            },
          }))}
        />
      </DashboardPanel>
    </DashboardLayout>
  );
}
