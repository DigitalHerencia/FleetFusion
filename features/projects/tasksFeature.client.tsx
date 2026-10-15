"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MyTasksTemplate } from "@/components/templates/myTasksTemplate";
import { ProjectTasksTemplate } from "@/components/templates/projectTasksTemplate";
import { TaskStatus } from "@/schemas/projectsSchemas";
import { updateTaskStatus } from "@/lib/actions/projectsActions";
import type { TaskDTO } from "@/types/projectsTypes";
export function TaskStatusControl({ task }: { task: TaskDTO }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <form
      className="space-y-2"
      action={(data) =>
        startTransition(async () => {
          setMessage("");
          try {
            await updateTaskStatus({
              taskId: task.id,
              expectedVersion: task.version,
              status: data.get("status"),
            });
            setMessage("Task updated.");
            router.refresh();
          } catch {
            setMessage(
              "Unable to update task. Check access or refresh to load the latest version.",
            );
          }
        })
      }
    >
      <div className="flex flex-wrap gap-2">
        <select
          className="control-field"
          name="status"
          aria-label={`Status for ${task.title}`}
          defaultValue={task.status}
          disabled={pending}
        >
          {Object.values(TaskStatus).map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <Button type="submit" size="sm" disabled={pending}>
          Update status
        </Button>
      </div>
      <p role="status" className="text-sm">
        {message}
      </p>
    </form>
  );
}
export function TasksFeatureClient({
  tasks,
  projectId,
  personal = false,
  title = "Task board",
}: {
  tasks: TaskDTO[];
  projectId?: string;
  personal?: boolean;
  title?: string;
}) {
  const [query, setQuery] = useState("");
  const Template = personal ? MyTasksTemplate : ProjectTasksTemplate;
  return (
    <Template
      title={title}
      tasks={tasks.filter((task) =>
        `${task.title} ${task.assignee?.displayName ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )}
      toolbar={
        <div className="flex flex-wrap gap-3">
          <Input
            aria-label="Search tasks"
            placeholder="Search task or assignee"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {projectId && (
            <Link
              className="type-link"
              href={`/projects/${projectId}/tasks/new`}
            >
              New task
            </Link>
          )}
        </div>
      }
      renderControls={(task) => (
        <TaskStatusControl key={`${task.id}-${task.version}`} task={task} />
      )}
    />
  );
}
