import { Suspense } from "react";

import { DashboardFeature } from "@/features/dashboard/dashboardFeature";
import { DashboardSkeleton } from "@/features/dashboard/dashboardSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardFeature />
    </Suspense>
  );
}
