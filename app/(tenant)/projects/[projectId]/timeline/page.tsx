import { Suspense } from "react";

import { TimelineFeature } from "@/features/projects/timelineFeature";
import { TimelineSkeleton } from "@/features/projects/timelineSkeleton";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <Suspense fallback={<TimelineSkeleton />}>
      <TimelineFeature projectId={projectId} />
    </Suspense>
  );
}
