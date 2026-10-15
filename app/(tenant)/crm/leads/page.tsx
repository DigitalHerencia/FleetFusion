import { Suspense } from "react";

import { CrmLeadsFeature } from "@/features/crm/crmLeadsFeature";
import { CrmLeadsSkeleton } from "@/features/crm/crmLeadsSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<CrmLeadsSkeleton />}>
      <CrmLeadsFeature />
    </Suspense>
  );
}
