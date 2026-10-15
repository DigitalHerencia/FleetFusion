import Link from "next/link";
import type { ReactNode } from "react";
import type { TaskDTO } from "@/types/projectsTypes";
import {
  DashboardLayout,
  DashboardPanel,
} from "@/components/blocks/dashboard-layout";
export function MyTasksTemplate({
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
      {["URGENT", "HIGH", "MEDIUM", "LOW"].map((priority) => (
        <DashboardPanel key={priority} title={`${priority} priority`}>
          <ul className="space-y-3">
            {tasks
              .filter((task) => task.priority === priority)
              .map((task) => (
                <li
                  key={task.id}
                  className="grid gap-4 border-b border-border py-3 lg:grid-cols-[1fr_auto]"
                >
                  <div>
                    <Link
                      className="type-label hover:underline"
                      href={`/projects/${task.projectId}/tasks/${task.id}`}
                    >
                      {task.title}
                    </Link>
                    <p className="mt-2">
                      Due {task.dueAt?.slice(0, 10) ?? "date not set"} ·{" "}
                      {task.status}
                    </p>
                  </div>
                  {renderControls(task)}
                </li>
              ))}
          </ul>
          {!tasks.some((task) => task.priority === priority) && (
            <p>No open tasks at this priority.</p>
          )}
        </DashboardPanel>
      ))}
    </DashboardLayout>
  );
}
