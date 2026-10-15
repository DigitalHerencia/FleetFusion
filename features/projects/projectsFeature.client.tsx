"use client";
import Link from "next/link";
import { useState } from "react";
import { ProjectsTemplate } from "@/components/templates/projectsTemplate";
import { Input } from "@/components/ui/input";
import type { ProjectSummaryDTO } from "@/types/projectsTypes";
export function ProjectsFeatureClient({
  projects,
}: {
  projects: ProjectSummaryDTO[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  return (
    <ProjectsTemplate
      projects={projects.filter(
        (project) =>
          (!status || project.status === status) &&
          `${project.name} ${project.description ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      )}
      toolbar={
        <div className="flex flex-wrap gap-3">
          <Input
            aria-label="Search projects"
            placeholder="Search projects"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="control-field"
            aria-label="Project status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            {[...new Set(projects.map((project) => project.status))].map(
              (value) => (
                <option key={value}>{value}</option>
              ),
            )}
          </select>
          <Link className="type-link" href="/projects/new">
            New project
          </Link>
        </div>
      }
    />
  );
}
