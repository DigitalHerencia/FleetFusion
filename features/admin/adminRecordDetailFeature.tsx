import { notFound } from "next/navigation";
import { getAdminRecordSummary } from "@/lib/fetchers/adminFetchers";
import { AdminRecordDetailTemplate } from "@/components/templates/adminRecordDetailTemplate";
export async function AdminRecordDetailFeature({
  recordId,
}: {
  recordId: string;
}) {
  const record = (await getAdminRecordSummary()).find(
    (item) => item.resource === recordId,
  );
  if (!record) notFound();
  return <AdminRecordDetailTemplate record={record} />;
}
