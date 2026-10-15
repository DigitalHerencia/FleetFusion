import type { ProjectSummaryDTO, TaskDTO } from "../../../types/projectsTypes";
import type {
  ProjectSummaryRecord,
  TaskRecord,
} from "../selects/projects.selects";

export function toProjectSummaryDTO(
  record: ProjectSummaryRecord,
): ProjectSummaryDTO {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    status: record.status,
    startsAt: record.startsAt?.toISOString() ?? null,
    dueAt: record.dueAt?.toISOString() ?? null,
    version: record.version,
    taskCount: record._count.tasks,
    openTaskCount: record.tasks.length,
  };
}

export function toTaskDTO(record: TaskRecord): TaskDTO {
  return {
    id: record.id,
    projectId: record.projectId,
    title: record.title,
    description: record.description,
    status: record.status,
    priority: record.priority,
    dueAt: record.dueAt?.toISOString() ?? null,
    completedAt: record.completedAt?.toISOString() ?? null,
    version: record.version,
    assignee: record.assignee
      ? {
          membershipId: record.assignee.id,
          displayName: record.assignee.user.displayName,
        }
      : null,
  };
}
