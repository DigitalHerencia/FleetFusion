import Link from "next/link";
import type { ReactNode } from "react";
import type { TaskDTO } from "@/types/projectsTypes";
import {
  DashboardLayout,
  DashboardPanel,
} from "@/components/blocks/dashboard-layout";
export function ProjectTaskDetailTemplate({
  task,
  children,
}: {
  task: TaskDTO;
  children: ReactNode;
}) {
  return (
    <DashboardLayout
      title={task.title}
      nav={[]}
      toolbar={
        <Link
          className="type-link"
          href={`/projects/${task.projectId}/tasks/${task.id}/edit`}
        >
          Edit task
        </Link>
      }
    >
      <Link className="type-link" href={`/projects/${task.projectId}/tasks`}>
        Back to task board
      </Link>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <DashboardPanel title="Brief and acceptance criteria">
          <p className="whitespace-pre-wrap">
            {task.description ?? "No description provided."}
          </p>
        </DashboardPanel>
        <DashboardPanel title="Task delivery">
          <dl className="space-y-2">
            <dt>Priority</dt>
            <dd>{task.priority}</dd>
            <dt>Assigned to</dt>
            <dd>{task.assignee?.displayName ?? "Unassigned"}</dd>
            <dt>Due date</dt>
            <dd>{task.dueAt?.slice(0, 10) ?? "Unscheduled"}</dd>
            <dt>Completed</dt>
            <dd>{task.completedAt?.slice(0, 10) ?? "Not completed"}</dd>
          </dl>
          <div className="mt-4">{children}</div>
        </DashboardPanel>
      </div>
    </DashboardLayout>
  );
}
