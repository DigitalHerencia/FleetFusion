import Link from "next/link";
import type { ProjectSummaryDTO, TaskDTO } from "@/types/projectsTypes";
import {
  DashboardLayout,
  DashboardPanel,
} from "@/components/blocks/dashboard-layout";
export function ProjectTimelineTemplate({
  project,
  tasks,
}: {
  project: ProjectSummaryDTO;
  tasks: TaskDTO[];
}) {
  const dates = [
    ...new Set(
      tasks
        .filter((task) => task.dueAt)
        .map((task) => task.dueAt!.slice(0, 10)),
    ),
  ].sort();
  return (
    <DashboardLayout
      title={`${project.name} · Timeline`}
      nav={[]}
      toolbar={
        <Link className="type-link" href={`/projects/${project.id}/tasks/new`}>
          Schedule a task
        </Link>
      }
    >
      <p>
        Project window: {project.startsAt?.slice(0, 10) ?? "No start date"} →{" "}
        {project.dueAt?.slice(0, 10) ?? "No deadline"}
      </p>
      <ol className="space-y-4 border-l-4 border-primary pl-5">
        {dates.map((date) => (
          <li key={date}>
            <DashboardPanel title={date}>
              <ul className="space-y-3">
                {tasks
                  .filter((task) => task.dueAt?.startsWith(date))
                  .map((task) => (
                    <li
                      key={task.id}
                      className="flex flex-wrap justify-between gap-3"
                    >
                      <Link
                        className="type-link"
                        href={`/projects/${project.id}/tasks/${task.id}`}
                      >
                        {task.title}
                      </Link>
                      <span>
                        {task.status} · {task.priority}
                      </span>
                    </li>
                  ))}
              </ul>
            </DashboardPanel>
          </li>
        ))}
      </ol>
      {dates.length === 0 && <p>No tasks have scheduled deadlines.</p>}
      <DashboardPanel title="Unscheduled work">
        <ul className="space-y-3">
          {tasks
            .filter((task) => !task.dueAt)
            .map((task) => (
              <li key={task.id}>
                <Link
                  className="type-link"
                  href={`/projects/${project.id}/tasks/${task.id}/edit`}
                >
                  {task.title} · Set a deadline
                </Link>
              </li>
            ))}
        </ul>
      </DashboardPanel>
    </DashboardLayout>
  );
}
