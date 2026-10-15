import Link from "next/link";
import type { ReactNode } from "react";
import type { ProjectSummaryDTO, TaskDTO } from "@/types/projectsTypes";
import {
  DashboardLayout,
  DashboardPanel,
} from "@/components/blocks/dashboard-layout";
export function ProjectDetailTemplate({
  project,
  tasks,
  children,
}: {
  project: ProjectSummaryDTO;
  tasks: TaskDTO[];
  children: ReactNode;
}) {
  return (
    <DashboardLayout
      title={project.name}
      nav={[]}
      toolbar={
        <Link className="type-link" href={`/projects/${project.id}/edit`}>
          Edit project
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <DashboardPanel title="Project brief">
          <p className="whitespace-pre-wrap">
            {project.description ?? "No brief has been written."}
          </p>
          <nav className="mt-6 flex flex-wrap gap-4">
            <Link className="type-link" href={`/projects/${project.id}/tasks`}>
              Task board
            </Link>
            <Link
              className="type-link"
              href={`/projects/${project.id}/timeline`}
            >
              Delivery timeline
            </Link>
            <Link
              className="type-link"
              href={`/projects/${project.id}/tasks/new`}
            >
              Add task
            </Link>
          </nav>
        </DashboardPanel>
        <DashboardPanel title="Delivery">
          <dl className="space-y-2">
            <dt>Status</dt>
            <dd>{project.status}</dd>
            <dt>Start / due</dt>
            <dd>
              {project.startsAt?.slice(0, 10) ?? "Unscheduled"} /{" "}
              {project.dueAt?.slice(0, 10) ?? "Unscheduled"}
            </dd>
            <dt>Remaining work</dt>
            <dd>
              {project.openTaskCount} open of {project.taskCount} tasks
            </dd>
            <dt>Blocked in loaded tasks</dt>
            <dd>{tasks.filter((task) => task.status === "BLOCKED").length}</dd>
          </dl>
        </DashboardPanel>
      </div>
      {children}
    </DashboardLayout>
  );
}
