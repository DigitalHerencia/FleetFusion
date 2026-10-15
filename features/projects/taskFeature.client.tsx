"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignProjectTask } from "@/lib/actions/projectsActions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { TaskDTO } from "@/types/projectsTypes";
export function TaskFeatureClient({
  task,
  members,
}: {
  task: TaskDTO;
  members: { id: string; name: string; status: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <form
      className="mt-5 space-y-3"
      action={(data) =>
        startTransition(async () => {
          try {
            await assignProjectTask({
              taskId: task.id,
              expectedVersion: task.version,
              assigneeMembershipId: data.get("assignee") || null,
            });
            setMessage("Assignee saved.");
            router.refresh();
          } catch {
            setMessage(
              "Assignment failed. Check access, membership, or reload the latest task.",
            );
          }
        })
      }
    >
      <Label htmlFor="task-assignee">Assign to</Label>
      <select
        id="task-assignee"
        className="control-field"
        name="assignee"
        defaultValue={task.assignee?.membershipId ?? ""}
      >
        <option value="">Unassigned</option>
        {members
          .filter((member) => member.status === "ACTIVE")
          .map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
      </select>
      <Button type="submit" disabled={pending}>
        Save assignment
      </Button>
      <p role="status">{message}</p>
    </form>
  );
}
