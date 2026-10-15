import { Suspense } from "react";

import { AdminAuditFeature } from "@/features/admin/adminAuditFeature";
import { AdminAuditSkeleton } from "@/features/admin/adminAuditSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<AdminAuditSkeleton />}>
      <AdminAuditFeature />
    </Suspense>
  );
}
