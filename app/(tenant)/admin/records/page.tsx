import { Suspense } from "react";

import { AdminRecordsFeature } from "@/features/admin/adminRecordsFeature";
import { AdminRecordsSkeleton } from "@/features/admin/adminRecordsSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<AdminRecordsSkeleton />}>
      <AdminRecordsFeature />
    </Suspense>
  );
}
