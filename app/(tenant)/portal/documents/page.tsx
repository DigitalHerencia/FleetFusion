import { Suspense } from "react";

import { DocumentsFeature } from "@/features/portal/documentsFeature";
import { DocumentsSkeleton } from "@/features/portal/documentsSkeleton";

export default async function Page() {
  return (
    <Suspense fallback={<DocumentsSkeleton />}>
      <DocumentsFeature />
    </Suspense>
  );
}
