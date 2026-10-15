import Link from "next/link";
import type { AdminRecordSummaryDTO } from "@/types/adminTypes";
import { DashboardLayout } from "@/components/blocks/dashboard-layout";
export function AdminRecordsTemplate({
  records,
}: {
  records: AdminRecordSummaryDTO[];
}) {
  return (
    <DashboardLayout title="Workspace record inventory" nav={[]}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {records.map((record) => (
          <Link
            className="space-y-3 surface-card p-5 hover:bg-primary/10"
            key={record.resource}
            href={`/admin/records/${encodeURIComponent(record.resource)}`}
          >
            <h2 className="type-label">{record.resource}</h2>
            <p className="text-3xl">{record.count}</p>
            <p className="text-sm">Inspect resource</p>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
