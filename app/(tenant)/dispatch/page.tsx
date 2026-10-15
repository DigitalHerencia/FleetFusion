import { Suspense } from "react";

import { DispatchFeature } from "@/features/dispatch/dispatchFeature";
import { DispatchSkeleton } from "@/features/dispatch/dispatchSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<DispatchSkeleton />}>
      <DispatchFeature />
    </Suspense>
  );
}