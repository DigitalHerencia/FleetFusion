import { TaskEditForm } from "@/features/projects/taskEditForm";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string; taskId: string }>;
}) {
  const { projectId, taskId } = await params;
  return <TaskEditForm projectId={projectId} taskId={taskId} />;
}
