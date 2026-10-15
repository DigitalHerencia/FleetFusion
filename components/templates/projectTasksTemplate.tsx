import Link from "next/link";
import type { ReactNode } from "react";
import type { TaskDTO } from "@/types/projectsTypes";
import { TaskStatus } from "@/schemas/projectsSchemas";
import {
  DashboardLayout,
  DashboardPanel,
} from "@/components/blocks/dashboard-layout";
export function ProjectTasksTemplate({
  title,
  tasks,
  toolbar,
  renderControls,
}: {
  title: string;
  tasks: readonly TaskDTO[];
  toolbar: ReactNode;
  renderControls: (task: TaskDTO) => ReactNode;
}) {
  return (
    <DashboardLayout title={title} nav={[]} toolbar={toolbar}>
      <p className="text-muted-primary">
        Showing up to 100 tasks. Open a task to review its brief or edit its
        schedule.
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.values(TaskStatus).map((status) => (
          <DashboardPanel
            key={status}
            title={`${status.replaceAll("_", " ")} · ${tasks.filter((task) => task.status === status).length}`}
          >
            <div className="space-y-3">
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <article
                    className="space-y-3 surface-inset p-4"
                    key={task.id}
                  >
                    <Link
                      className="type-label hover:underline"
                      href={`/projects/${task.projectId}/tasks/${task.id}`}
                    >
                      {task.title}
                    </Link>
                    <p>{task.priority} priority</p>
                    <p className="text-sm text-muted-primary">
                      {task.assignee?.displayName ?? "Unassigned"} ·{" "}
                      {task.dueAt?.slice(0, 10) ?? "No due date"}
                    </p>
                    {renderControls(task)}
                  </article>
                ))}
              {!tasks.some((task) => task.status === status) && (
                <p className="p-3 text-muted-primary">No tasks.</p>
              )}
            </div>
          </DashboardPanel>
        ))}
      </div>
    </DashboardLayout>
  );
}
