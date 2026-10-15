import "server-only";

import { assertPermission } from "../authz/permissions";
import { toProjectSummaryDTO, toTaskDTO } from "../db/dto/projects.dto";
import {
  projectSummarySelect,
  taskSelect,
} from "../db/selects/projects.selects";
import { withAuthenticatedRead } from "../db/tenant";

export async function getProjects(limit = 50) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "projects:read");

    const rows = await tx.project.findMany({
      where: {
        organizationId: access.organizationId,
        archivedAt: null,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: Math.min(Math.max(limit, 1), 100),
      select: projectSummarySelect,
    });

    return rows.map(toProjectSummaryDTO);
  });
}

export async function getProject(projectId: string) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "projects:read");
    const row = await tx.project.findFirst({
      where: {
        id: projectId,
        organizationId: access.organizationId,
        archivedAt: null,
      },
      select: projectSummarySelect,
    });
    return row ? toProjectSummaryDTO(row) : null;
  });
}

export async function getProjectTasks(projectId: string, limit = 100) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "projects:read");

    const rows = await tx.task.findMany({
      where: {
        organizationId: access.organizationId,
        projectId,
      },
      orderBy: [
        {
          position: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
      take: Math.min(Math.max(limit, 1), 200),
      select: taskSelect,
    });

    return rows.map(toTaskDTO);
  });
}

export async function getMyTasks(limit = 100) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "projects:read");

    const rows = await tx.task.findMany({
      where: {
        organizationId: access.organizationId,
        assigneeMembershipId: access.membershipId,
        status: {
          notIn: ["DONE", "CANCELED"],
        },
      },
      orderBy: [
        {
          dueAt: "asc",
        },
        {
          priority: "desc",
        },
      ],
      take: Math.min(Math.max(limit, 1), 200),
      select: taskSelect,
    });

    return rows.map(toTaskDTO);
  });
}

export async function getProjectTaskDependencyFacts(projectId: string) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "projects:read");
    return tx.task.findMany({
      where: { organizationId: access.organizationId, projectId },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        status: true,
        dependencies: { select: { dependsOnTaskId: true } },
      },
    });
  });
}

export async function getProjectTask(projectId: string, taskId: string) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "projects:read");
    const row = await tx.task.findFirst({
      where: { id: taskId, projectId, organizationId: access.organizationId },
      select: taskSelect,
    });
    return row ? toTaskDTO(row) : null;
  });
}
