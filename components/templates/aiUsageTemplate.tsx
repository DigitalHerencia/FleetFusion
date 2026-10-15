import type { AiUsageSummaryDTO } from "@/types/aiTypes";
import {
  DashboardLayout,
  DashboardPanel,
} from "@/components/blocks/dashboard-layout";
export function AiUsageTemplate({ usage }: { usage: AiUsageSummaryDTO }) {
  return (
    <DashboardLayout title="My AI usage" nav={[]}>
      <DashboardPanel title="Recorded usage ledger">
        <dl className="grid gap-4 sm:grid-cols-2">
          <dt>Generation entries</dt>
          <dd>{usage.generationCount}</dd>
          <dt>Input tokens recorded</dt>
          <dd>{usage.inputTokens}</dd>
          <dt>Output tokens recorded</dt>
          <dd>{usage.outputTokens}</dd>
          <dt>Cost recorded (USD)</dt>
          <dd>{usage.cost}</dd>
        </dl>
      </DashboardPanel>
      <p className="text-muted-primary">
        The current generation adapter records zero token and cost values when
        usage is not supplied. These totals are not a provider billing
        statement.
      </p>
    </DashboardLayout>
  );
}
