import {
  getPortalDocuments,
  getPortalWriteAccess,
} from "@/lib/fetchers/portalFetchers";
import { DocumentsFeatureClient } from "./documentsFeature.client";
export async function DocumentsFeature() {
  const [documents, canWrite] = await Promise.all([
    getPortalDocuments(),
    getPortalWriteAccess(),
  ]);
  return <DocumentsFeatureClient documents={documents} canWrite={canWrite} />;
}
