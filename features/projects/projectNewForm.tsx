"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { ProjectSummaryDTO } from "@/types/projectsTypes";
import { createProject, updateProject } from "@/lib/actions/projectsActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormValues {
  name: string;
  description: string;
  startsAt: string;
  dueAt: string;
}
export function ProjectNewForm({ project }: { project?: ProjectSummaryDTO }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      startsAt: project?.startsAt?.slice(0, 10) ?? "",
      dueAt: project?.dueAt?.slice(0, 10) ?? "",
    },
  });
  return (
    <form
      className="mx-auto max-w-3xl space-y-5 surface-card p-5"
      onSubmit={handleSubmit(async (values) => {
        setError("");
        try {
          const input = {
            ...values,
            startsAt: values.startsAt || null,
            dueAt: values.dueAt || null,
          };
          const saved = project
            ? await updateProject({
                ...input,
                projectId: project.id,
                expectedVersion: project.version,
              })
            : await createProject(input);
          router.push(`/projects/${saved.id}`);
          router.refresh();
        } catch {
          setError(
            "Project could not be saved. Check your dates and permissions, then try again.",
          );
        }
      })}
    >
      <h1 className="type-title">
        {project ? "Edit project" : "Plan a project"}
      </h1>
      <div className="form-field">
        <Label htmlFor="project-name">Project name</Label>
        <Input
          id="project-name"
          required
          maxLength={200}
          {...register("name")}
        />
      </div>
      <div className="form-field">
        <Label htmlFor="project-description">Project brief</Label>
        <textarea
          id="project-description"
          className="control-field min-h-36"
          maxLength={10000}
          {...register("description")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="form-field">
          <Label htmlFor="project-start">Starts on</Label>
          <Input id="project-start" type="date" {...register("startsAt")} />
        </div>
        <div className="form-field">
          <Label htmlFor="project-due">Due on</Label>
          <Input id="project-due" type="date" {...register("dueAt")} />
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : project ? "Save project" : "Create project"}
      </Button>
    </form>
  );
}
