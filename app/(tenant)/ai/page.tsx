import { Suspense } from "react";

import { AiGenerationFeature } from "@/features/ai/aiGenerationFeature";
import { AiGenerationSkeleton } from "@/features/ai/aiGenerationSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<AiGenerationSkeleton />}>
      <AiGenerationFeature />
    </Suspense>
  );
}
