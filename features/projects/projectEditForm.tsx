import { notFound } from "next/navigation";
import { getProject } from "@/lib/fetchers/projectsFetchers";
import { ProjectNewForm } from "./projectNewForm";
export async function ProjectEditForm({ projectId }: { projectId: string }) {
  const project = await getProject(projectId);
  if (!project) notFound();
  return <ProjectNewForm project={project} />;
}
