import { ProjectTimelineTemplate } from "@/components/templates/projectTimelineTemplate";
import { getProjectWorkspaceWorkflow } from "@/lib/workflows/projectsWorkflows";
export async function TimelineFeature({ projectId }: { projectId: string }) {
  const workspace = await getProjectWorkspaceWorkflow(projectId);
  return <ProjectTimelineTemplate {...workspace} />;
}
