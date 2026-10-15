import { Suspense } from "react";

import { CrmAnalyticsFeature } from "@/features/crm/crmAnalyticsFeature";
import { CrmAnalyticsSkeleton } from "@/features/crm/crmAnalyticsSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<CrmAnalyticsSkeleton />}>
      <CrmAnalyticsFeature />
    </Suspense>
  );
}
