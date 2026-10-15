import type { Prisma, TaskStatus } from "../../../generated/prisma/client";

import { taskSelect } from "../selects/projects.selects";
import { ConcurrencyConflictError } from "./errors";

export async function updateTaskStatusTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    taskId: string;
    status: TaskStatus;
    expectedVersion: number;
  },
) {
  const result = await tx.task.updateMany({
    where: {
      id: input.taskId,
      organizationId: input.organizationId,
      version: input.expectedVersion,
    },
    data: {
      status: input.status,
      completedAt: input.status === "DONE" ? new Date() : null,
      version: {
        increment: 1,
      },
    },
  });

  if (result.count !== 1) {
    throw new ConcurrencyConflictError("Task");
  }

  return tx.task.findFirstOrThrow({
    where: {
      id: input.taskId,
      organizationId: input.organizationId,
    },
    select: taskSelect,
  });
}
