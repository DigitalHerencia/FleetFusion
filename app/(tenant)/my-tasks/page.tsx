import { Suspense } from "react";

import { MyTasksFeature } from "@/features/projects/myTasksFeature";
import { MyTasksSkeleton } from "@/features/projects/myTasksSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<MyTasksSkeleton />}>
      <MyTasksFeature />
    </Suspense>
  );
}
