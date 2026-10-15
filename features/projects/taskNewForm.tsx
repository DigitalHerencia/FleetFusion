"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createTask, updateTask } from "@/lib/actions/projectsActions";
import { TaskPriority } from "@/schemas/projectsSchemas";
import type { TaskDTO } from "@/types/projectsTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormValues {
  title: string;
  description: string;
  priority: string;
  dueAt: string;
}
export function TaskNewForm({
  projectId,
  task,
}: {
  projectId: string;
  task?: TaskDTO;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      priority: task?.priority ?? "MEDIUM",
      dueAt: task?.dueAt?.slice(0, 10) ?? "",
    },
  });
  return (
    <form
      className="mx-auto max-w-3xl space-y-5 surface-card p-5"
      onSubmit={handleSubmit(async (values) => {
        setError("");
        try {
          const input = { ...values, projectId, dueAt: values.dueAt || null };
          const saved = task
            ? await updateTask({
                ...input,
                taskId: task.id,
                expectedVersion: task.version,
              })
            : await createTask(input);
          router.push(`/projects/${projectId}/tasks/${saved.id}`);
          router.refresh();
        } catch {
          setError(
            "Task could not be saved. Check your input and permissions. If this record changed, reload before editing again.",
          );
        }
      })}
    >
      <h1 className="type-title">{task ? "Edit task" : "Plan a task"}</h1>
      <div className="form-field">
        <Label htmlFor="task-title">Task title</Label>
        <Input
          id="task-title"
          required
          maxLength={300}
          {...register("title")}
        />
      </div>
      <div className="form-field">
        <Label htmlFor="task-description">
          Description and acceptance criteria
        </Label>
        <textarea
          id="task-description"
          className="control-field min-h-36"
          maxLength={20000}
          {...register("description")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="form-field">
          <Label htmlFor="task-priority">Priority</Label>
          <select
            id="task-priority"
            className="control-field"
            {...register("priority")}
          >
            {Object.values(TaskPriority).map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <Label htmlFor="task-due">Due on</Label>
          <Input id="task-due" type="date" {...register("dueAt")} />
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : task ? "Save task" : "Create task"}
      </Button>
    </form>
  );
}
