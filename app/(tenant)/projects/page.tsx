import { Suspense } from "react";

import { ProjectsFeature } from "@/features/projects/projectsFeature";
import { ProjectsSkeleton } from "@/features/projects/projectsSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<ProjectsSkeleton />}>
      <ProjectsFeature />
    </Suspense>
  );
}
