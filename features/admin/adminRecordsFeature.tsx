import { getAdminRecordSummary } from "@/lib/fetchers/adminFetchers";
import { AdminRecordsTemplate } from "@/components/templates/adminRecordsTemplate";
export async function AdminRecordsFeature() {
  return <AdminRecordsTemplate records={await getAdminRecordSummary()} />;
}
