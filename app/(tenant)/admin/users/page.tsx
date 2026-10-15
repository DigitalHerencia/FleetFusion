import { Suspense } from "react";

import { AdminUsersFeature } from "@/features/admin/adminUsersFeature";
import { AdminUsersSkeleton } from "@/features/admin/adminUsersSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<AdminUsersSkeleton />}>
      <AdminUsersFeature />
    </Suspense>
  );
}
