import Link from "next/link";
import type { ReactNode } from "react";
import type { ProjectSummaryDTO } from "@/types/projectsTypes";
import { DashboardLayout } from "@/components/blocks/dashboard-layout";

export function ProjectsTemplate({
  projects,
  toolbar,
}: {
  projects: readonly ProjectSummaryDTO[];
  toolbar: ReactNode;
}) {
  return (
    <DashboardLayout title="Project portfolio" nav={[]} toolbar={toolbar}>
      <p className="text-muted-primary">
        Delivery status and remaining work across up to 100 projects.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="space-y-4 surface-card p-5">
            <header className="flex flex-wrap justify-between gap-3">
              <Link
                className="type-title hover:underline"
                href={`/projects/${project.id}`}
              >
                {project.name}
              </Link>
              <span>{project.status.replaceAll("_", " ")}</span>
            </header>
            <p className="whitespace-pre-wrap text-muted-primary">
              {project.description ?? "No project brief yet."}
            </p>
            <div>
              <label htmlFor={`progress-${project.id}`}>
                {project.taskCount - project.openTaskCount} of{" "}
                {project.taskCount} tasks closed
              </label>
              <progress
                id={`progress-${project.id}`}
                className="mt-2 block w-full accent-primary"
                max={Math.max(1, project.taskCount)}
                value={project.taskCount - project.openTaskCount}
              />
            </div>
            <p>
              Start: {project.startsAt?.slice(0, 10) ?? "Unscheduled"} · Due:{" "}
              {project.dueAt?.slice(0, 10) ?? "Unscheduled"}
            </p>
            <nav
              className="flex flex-wrap gap-4"
              aria-label={`${project.name} views`}
            >
              <Link
                className="type-link"
                href={`/projects/${project.id}/tasks`}
              >
                Task board
              </Link>
              <Link
                className="type-link"
                href={`/projects/${project.id}/timeline`}
              >
                Timeline
              </Link>
              <Link className="type-link" href={`/projects/${project.id}/edit`}>
                Edit project
              </Link>
            </nav>
          </article>
        ))}
      </div>
      {projects.length === 0 && (
        <p className="surface-inset p-6">
          No matching projects. Create a project to plan your first delivery.
        </p>
      )}
    </DashboardLayout>
  );
}
