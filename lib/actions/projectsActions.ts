"use server";

import {
  createProjectSchema,
  createTaskSchema,
  updateTaskStatusSchema,
  assignTaskSchema,
  updateProjectSchema,
  updateTaskSchema,
} from "@/schemas/projectsSchemas";
import { requireIdentity } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/authz/permissions";
import { toProjectSummaryDTO, toTaskDTO } from "@/lib/db/dto/projects.dto";
import {
  projectSummarySelect,
  taskSelect,
} from "@/lib/db/selects/projects.selects";
import { withTenantTransaction } from "@/lib/db/tenant";
import { ResourceNotFoundError } from "@/lib/db/transactions/errors";
import { assignTaskTx } from "@/lib/db/transactions/projects.tx";
import { updateTaskStatusTx } from "@/lib/db/transactions/update-task-status.tx";
import { ConcurrencyConflictError } from "@/lib/db/transactions/errors";

export async function createProject(rawInput: unknown) {
  const input = createProjectSchema.parse(rawInput);
  if (input.startsAt && input.dueAt && input.startsAt > input.dueAt)
    throw new Error("Due date must follow start date.");
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "projects:write");
    const record = await tx.project.create({
      data: {
        organizationId: access.organizationId,
        ownerMembershipId: access.membershipId,
        name: input.name,
        description: input.description ?? null,
        startsAt: input.startsAt ?? null,
        dueAt: input.dueAt ?? null,
        status: "PLANNED",
        members: {
          create: {
            organizationId: access.organizationId,
            membershipId: access.membershipId,
            role: "OWNER",
          },
        },
      },
      select: projectSummarySelect,
    });
    await tx.auditEvent.create({
      data: {
        organizationId: access.organizationId,
        actorUserId: access.userId,
        action: "project.created",
        resourceType: "Project",
        resourceId: record.id,
      },
    });
    return toProjectSummaryDTO(record);
  });
}

export async function createTask(rawInput: unknown) {
  const input = createTaskSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "projects:write");
    const project = await tx.project.findFirst({
      where: {
        id: input.projectId,
        organizationId: access.organizationId,
        archivedAt: null,
      },
      select: { id: true },
    });
    if (!project) throw new ResourceNotFoundError("Project");
    if (
      input.assigneeMembershipId &&
      !(await tx.membership.findFirst({
        where: {
          id: input.assigneeMembershipId,
          organizationId: access.organizationId,
          status: "ACTIVE",
        },
        select: { id: true },
      }))
    )
      throw new ResourceNotFoundError("Assignee");
    if (
      input.milestoneId &&
      !(await tx.milestone.findFirst({
        where: {
          id: input.milestoneId,
          projectId: input.projectId,
          organizationId: access.organizationId,
        },
        select: { id: true },
      }))
    )
      throw new ResourceNotFoundError("Milestone");
    if (
      input.parentTaskId &&
      !(await tx.task.findFirst({
        where: {
          id: input.parentTaskId,
          projectId: input.projectId,
          organizationId: access.organizationId,
        },
        select: { id: true },
      }))
    )
      throw new ResourceNotFoundError("Parent task");
    const record = await tx.task.create({
      data: {
        organizationId: access.organizationId,
        projectId: input.projectId,
        milestoneId: input.milestoneId ?? null,
        parentTaskId: input.parentTaskId ?? null,
        assigneeMembershipId: input.assigneeMembershipId ?? null,
        title: input.title,
        description: input.description ?? null,
        priority: input.priority,
        dueAt: input.dueAt ?? null,
      },
      select: taskSelect,
    });
    return toTaskDTO(record);
  });
}

export async function updateTaskStatus(rawInput: unknown) {
  const input = updateTaskStatusSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "projects:write");
    const record = await updateTaskStatusTx(tx, {
      organizationId: access.organizationId,
      taskId: input.taskId,
      status: input.status,
      expectedVersion: input.expectedVersion,
    });
    return toTaskDTO(record);
  });
}

export async function updateProject(rawInput: unknown) {
  const input = updateProjectSchema.parse(rawInput);
  if (input.startsAt && input.dueAt && input.startsAt > input.dueAt)
    throw new Error("Due date must follow start date.");
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "projects:write");
    const result = await tx.project.updateMany({
      where: {
        id: input.projectId,
        organizationId: access.organizationId,
        archivedAt: null,
        version: input.expectedVersion,
      },
      data: {
        name: input.name,
        description: input.description ?? null,
        startsAt: input.startsAt ?? null,
        dueAt: input.dueAt ?? null,
        version: { increment: 1 },
      },
    });
    if (result.count !== 1) throw new ConcurrencyConflictError("Project");
    return toProjectSummaryDTO(
      await tx.project.findFirstOrThrow({
        where: { id: input.projectId, organizationId: access.organizationId },
        select: projectSummarySelect,
      }),
    );
  });
}

export async function updateTask(rawInput: unknown) {
  const input = updateTaskSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "projects:write");
    const result = await tx.task.updateMany({
      where: {
        id: input.taskId,
        projectId: input.projectId,
        organizationId: access.organizationId,
        version: input.expectedVersion,
      },
      data: {
        title: input.title,
        description: input.description ?? null,
        priority: input.priority,
        dueAt: input.dueAt ?? null,
        version: { increment: 1 },
      },
    });
    if (result.count !== 1) throw new ConcurrencyConflictError("Task");
    return toTaskDTO(
      await tx.task.findFirstOrThrow({
        where: { id: input.taskId, organizationId: access.organizationId },
        select: taskSelect,
      }),
    );
  });
}

export async function assignProjectTask(rawInput: unknown) {
  const input = assignTaskSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "projects:write");
    return toTaskDTO(
      await assignTaskTx(tx, {
        ...input,
        organizationId: access.organizationId,
      }),
    );
  });
}
