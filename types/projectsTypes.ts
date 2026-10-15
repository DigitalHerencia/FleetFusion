export interface ProjectSummaryDTO {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startsAt: string | null;
  dueAt: string | null;
  version: number;
  taskCount: number;
  openTaskCount: number;
}
export interface TaskDTO {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueAt: string | null;
  completedAt: string | null;
  version: number;
  assignee: { membershipId: string; displayName: string | null } | null;
}
