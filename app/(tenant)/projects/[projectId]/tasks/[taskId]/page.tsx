import { Suspense } from "react";

import { TaskFeature } from "@/features/projects/taskFeature";
import { TaskSkeleton } from "@/features/projects/taskSkeleton";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string; taskId: string }>;
}) {
  const { projectId, taskId } = await params;
  return (
    <Suspense fallback={<TaskSkeleton />}>
      <TaskFeature projectId={projectId} taskId={taskId} />
    </Suspense>
  );
}
