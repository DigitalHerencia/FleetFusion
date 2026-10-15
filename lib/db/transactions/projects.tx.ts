import type { Prisma } from "@/generated/prisma/client";

import { projectSummarySelect, taskSelect } from "../selects/projects.selects";
import { InvariantViolationError, ResourceNotFoundError } from "./errors";

export async function assignTaskTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    taskId: string;
    assigneeMembershipId: string | null;
    expectedVersion: number;
  },
) {
  if (input.assigneeMembershipId) {
    const membership = await tx.membership.findFirst({
      where: {
        id: input.assigneeMembershipId,
        organizationId: input.organizationId,
        status: "ACTIVE",
      },
      select: { id: true },
    });
    if (!membership) throw new ResourceNotFoundError("Assignee membership");
  }
  const result = await tx.task.updateMany({
    where: {
      id: input.taskId,
      organizationId: input.organizationId,
      version: input.expectedVersion,
    },
    data: {
      assigneeMembershipId: input.assigneeMembershipId,
      version: { increment: 1 },
    },
  });
  if (result.count !== 1)
    throw new InvariantViolationError("Task assignment conflicted.");
  return tx.task.findFirstOrThrow({
    where: { id: input.taskId, organizationId: input.organizationId },
    select: taskSelect,
  });
}

export async function completeMilestoneTx(
  tx: Prisma.TransactionClient,
  input: { organizationId: string; milestoneId: string },
) {
  const milestone = await tx.milestone.findFirst({
    where: { id: input.milestoneId, organizationId: input.organizationId },
    select: {
      id: true,
      tasks: { select: { status: true } },
    },
  });
  if (!milestone) throw new ResourceNotFoundError("Milestone");
  if (
    milestone.tasks.some((task) => !["DONE", "CANCELED"].includes(task.status))
  ) {
    throw new InvariantViolationError(
      "A milestone cannot complete with open tasks.",
    );
  }
  return tx.milestone.update({
    where: { id: milestone.id },
    data: { completedAt: new Date() },
    select: { id: true, completedAt: true },
  });
}

export async function completeProjectTx(
  tx: Prisma.TransactionClient,
  input: { organizationId: string; projectId: string; expectedVersion: number },
) {
  const project = await tx.project.findFirst({
    where: { id: input.projectId, organizationId: input.organizationId },
    select: {
      id: true,
      tasks: { select: { status: true } },
      milestones: { select: { completedAt: true } },
    },
  });
  if (!project) throw new ResourceNotFoundError("Project");
  if (
    project.tasks.some((task) => !["DONE", "CANCELED"].includes(task.status)) ||
    project.milestones.some((milestone) => !milestone.completedAt)
  ) {
    throw new InvariantViolationError(
      "A project cannot complete with open tasks or milestones.",
    );
  }
  const result = await tx.project.updateMany({
    where: {
      id: project.id,
      organizationId: input.organizationId,
      version: input.expectedVersion,
    },
    data: { status: "COMPLETED", version: { increment: 1 } },
  });
  if (result.count !== 1)
    throw new InvariantViolationError("Project completion conflicted.");
  return tx.project.findFirstOrThrow({
    where: { id: project.id, organizationId: input.organizationId },
    select: projectSummarySelect,
  });
}

export async function rescheduleDependentTasksTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    taskId: string;
    dueAt: Date;
  },
) {
  const source = await tx.task.findFirst({
    where: { id: input.taskId, organizationId: input.organizationId },
    select: { id: true, projectId: true, dueAt: true },
  });
  if (!source) throw new ResourceNotFoundError("Task");
  const dependencies = await tx.taskDependency.findMany({
    where: {
      organizationId: input.organizationId,
      task: { projectId: source.projectId },
    },
    select: { taskId: true, dependsOnTaskId: true },
  });
  const requiredBy = new Map<string, string[]>();
  for (const dependency of dependencies) {
    const current = requiredBy.get(dependency.dependsOnTaskId) ?? [];
    current.push(dependency.taskId);
    requiredBy.set(dependency.dependsOnTaskId, current);
  }
  const affected = new Set<string>([source.id]);
  const pending = [source.id];
  while (pending.length) {
    const current = pending.shift()!;
    for (const dependentId of requiredBy.get(current) ?? []) {
      if (!affected.has(dependentId)) {
        affected.add(dependentId);
        pending.push(dependentId);
      }
    }
  }
  const tasks = await tx.task.findMany({
    where: {
      organizationId: input.organizationId,
      id: { in: [...affected] },
    },
    select: { id: true, dueAt: true },
  });
  const delta = source.dueAt
    ? input.dueAt.getTime() - source.dueAt.getTime()
    : 0;
  for (const task of tasks) {
    const dueAt =
      task.id === source.id
        ? input.dueAt
        : task.dueAt
          ? new Date(task.dueAt.getTime() + delta)
          : null;
    await tx.task.update({
      where: { id: task.id },
      data: { dueAt, version: { increment: 1 } },
    });
  }
  return tasks.map((task) => task.id);
}
