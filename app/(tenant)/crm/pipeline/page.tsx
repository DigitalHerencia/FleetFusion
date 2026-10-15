import { Suspense } from "react";

import { CrmPipelineFeature } from "@/features/crm/crmPipelineFeature";
import { CrmPipelineSkeleton } from "@/features/crm/crmPipelineSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<CrmPipelineSkeleton />}>
      <CrmPipelineFeature />
    </Suspense>
  );
}
