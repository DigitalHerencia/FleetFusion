import { Suspense } from "react";

import { AiPlaygroundFeature } from "@/features/ai/aiPlaygroundFeature";
import { AiPlaygroundSkeleton } from "@/features/ai/aiPlaygroundSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<AiPlaygroundSkeleton />}>
      <AiPlaygroundFeature />
    </Suspense>
  );
}
