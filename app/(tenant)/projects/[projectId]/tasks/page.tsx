import { Suspense } from "react";

import { TasksFeature } from "@/features/projects/tasksFeature";
import { TasksSkeleton } from "@/features/projects/tasksSkeleton";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <Suspense fallback={<TasksSkeleton />}>
      <TasksFeature projectId={projectId} />
    </Suspense>
  );
}
