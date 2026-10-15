import Link from "next/link";
import { ProjectDetailTemplate } from "@/components/templates/projectDetailTemplate";
import { DashboardPanel } from "@/components/blocks/dashboard-layout";
import { getProjectWorkspaceWorkflow } from "@/lib/workflows/projectsWorkflows";
export async function ProjectFeature({ projectId }: { projectId: string }) {
  const { project, tasks } = await getProjectWorkspaceWorkflow(projectId);
  const open = tasks
    .filter((task) => !["DONE", "CANCELED"].includes(task.status))
    .sort((left, right) =>
      (left.dueAt ?? "9999").localeCompare(right.dueAt ?? "9999"),
    );
  return (
    <ProjectDetailTemplate project={project} tasks={tasks}>
      <DashboardPanel title="Upcoming work">
        <ol className="space-y-3">
          {open.slice(0, 8).map((task) => (
            <li
              key={task.id}
              className="flex flex-wrap justify-between gap-3 border-b border-border py-3"
            >
              <Link
                className="type-link"
                href={`/projects/${projectId}/tasks/${task.id}`}
              >
                {task.title}
              </Link>
              <span>
                {task.dueAt?.slice(0, 10) ?? "Unscheduled"} · {task.status}
              </span>
            </li>
          ))}
        </ol>
        {!open.length && <p>No open tasks in the loaded project work.</p>}
      </DashboardPanel>
    </ProjectDetailTemplate>
  );
}
