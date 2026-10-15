import { Suspense } from "react";

import { AiUsageFeature } from "@/features/ai/aiUsageFeature";
import { AiUsageSkeleton } from "@/features/ai/aiUsageSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<AiUsageSkeleton />}>
      <AiUsageFeature />
    </Suspense>
  );
}
