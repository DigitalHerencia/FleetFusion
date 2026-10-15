import { Suspense } from "react";

import { DocumentFeature } from "@/features/portal/documentFeature";
import { DocumentSkeleton } from "@/features/portal/documentSkeleton";

export default async function Page({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  return (
    <Suspense fallback={<DocumentSkeleton />}>
      <DocumentFeature documentId={documentId} />
    </Suspense>
  );
}
