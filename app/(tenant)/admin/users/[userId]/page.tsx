import { Suspense } from "react";

import { AdminUserDetailFeature } from "@/features/admin/adminUserDetailFeature";
import { AdminUserDetailSkeleton } from "@/features/admin/adminUserDetailSkeleton";

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return (
    <Suspense fallback={<AdminUserDetailSkeleton />}>
      <AdminUserDetailFeature userId={userId} />
    </Suspense>
  );
}
