import type { AdminRecordSummaryDTO } from "@/types/adminTypes";
import {
  DashboardLayout,
  DashboardPanel,
} from "@/components/blocks/dashboard-layout";
export function AdminRecordDetailTemplate({
  record,
}: {
  record: AdminRecordSummaryDTO;
}) {
  return (
    <DashboardLayout title={record.resource} nav={[]}>
      <DashboardPanel title="Tenant inventory">
        <p className="text-3xl">{record.count}</p>
        <p className="mt-3">Persisted records in the active workspace.</p>
      </DashboardPanel>
    </DashboardLayout>
  );
}
