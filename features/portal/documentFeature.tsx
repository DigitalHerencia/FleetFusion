import { notFound } from "next/navigation";
import { getPortalDocumentWorkflow } from "@/lib/workflows/portalWorkflows";
import {
  getPortalAssets,
  getPortalWriteAccess,
} from "@/lib/fetchers/portalFetchers";
import { PortalDocumentDetailTemplate } from "@/components/templates/portalDocumentDetailTemplate";
import { PortalDocumentControls } from "./portalDocumentControls.client";
import { WorkspaceFileUpload } from "./workspaceFileUpload.client";
import { DocumentFeatureClient } from "./documentFeature.client";
export async function DocumentFeature({ documentId }: { documentId: string }) {
  const document = await getPortalDocumentWorkflow(documentId);
  if (!document) notFound();
  const canWrite = await getPortalWriteAccess();
  return (
    <PortalDocumentDetailTemplate document={document}>
      <PortalDocumentControls document={document} canWrite={canWrite} />
      {canWrite && <WorkspaceFileUpload domain="portal" />}
      {canWrite && (
        <DocumentFeatureClient
          key={document.version}
          document={document}
          assets={await getPortalAssets()}
        />
      )}
    </PortalDocumentDetailTemplate>
  );
}
