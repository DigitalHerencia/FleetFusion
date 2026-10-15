import type { Prisma } from "../../../generated/prisma/client";

export const projectSummarySelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  startsAt: true,
  dueAt: true,
  version: true,
  _count: {
    select: {
      tasks: true,
    },
  },
  tasks: {
    where: {
      status: {
        notIn: ["DONE", "CANCELED"],
      },
    },
    select: {
      id: true,
    },
  },
} satisfies Prisma.ProjectSelect;

export const taskSelect = {
  id: true,
  projectId: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  dueAt: true,
  completedAt: true,
  version: true,
  assignee: {
    select: {
      id: true,
      user: {
        select: {
          displayName: true,
        },
      },
    },
  },
} satisfies Prisma.TaskSelect;

export type ProjectSummaryRecord = Prisma.ProjectGetPayload<{
  select: typeof projectSummarySelect;
}>;

export type TaskRecord = Prisma.TaskGetPayload<{
  select: typeof taskSelect;
}>;
