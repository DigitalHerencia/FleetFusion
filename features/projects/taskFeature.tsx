import { notFound } from "next/navigation";
import { ProjectTaskDetailTemplate } from "@/components/templates/projectTaskDetailTemplate";
import { getTaskWorkflow } from "@/lib/workflows/projectsWorkflows";
import { TaskFeatureClient } from "./taskFeature.client";
import { getOrganizationMembers } from "@/lib/fetchers/organizationFetchers";
import { TaskStatusControl } from "./tasksFeature.client";
export async function TaskFeature({
  projectId,
  taskId,
}: {
  projectId: string;
  taskId: string;
}) {
  const task = await getTaskWorkflow(projectId, taskId);
  if (!task) notFound();
  return (
    <ProjectTaskDetailTemplate task={task}>
      <TaskStatusControl key={task.version} task={task} />
      <TaskFeatureClient
        key={`assignment-${task.version}`}
        task={task}
        members={await getOrganizationMembers()}
      />
    </ProjectTaskDetailTemplate>
  );
}
