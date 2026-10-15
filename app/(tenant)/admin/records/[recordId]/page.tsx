import { Suspense } from "react";

import { AdminRecordDetailFeature } from "@/features/admin/adminRecordDetailFeature";
import { AdminRecordDetailSkeleton } from "@/features/admin/adminRecordDetailSkeleton";

export default async function Page({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;
  return (
    <Suspense fallback={<AdminRecordDetailSkeleton />}>
      <AdminRecordDetailFeature recordId={recordId} />
    </Suspense>
  );
}
