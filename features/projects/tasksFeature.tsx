import { TasksFeatureClient } from "./tasksFeature.client";
import { getProjectWorkspaceWorkflow } from "@/lib/workflows/projectsWorkflows";
export async function TasksFeature({ projectId }: { projectId: string }) {
  const { project, tasks } = await getProjectWorkspaceWorkflow(projectId);
  return (
    <TasksFeatureClient
      tasks={tasks}
      projectId={projectId}
      title={`${project.name} · Task board`}
    />
  );
}
