import { ProjectEditForm } from "@/features/projects/projectEditForm";

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectEditForm projectId={projectId} />;
}
