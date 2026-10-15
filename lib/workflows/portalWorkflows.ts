import {
  getPortalDocument,
  getPortalBilling,
  getPortalDocuments,
} from "@/lib/fetchers/portalFetchers";
import type { PortalApprovalDecision } from "@/types/portalTypes";

export async function getPortalWorkspaceWorkflow(limit = 100) {
  const [documents, billing] = await Promise.all([
    getPortalDocuments(limit),
    getPortalBilling(),
  ]);
  return { documents, billing };
}

export async function getPortalDocumentWorkflow(documentId: string) {
  return getPortalDocument(documentId);
}

export function determineApprovalState(decisions: PortalApprovalDecision[]) {
  if (decisions.some((decision) => decision.status === "REJECTED")) {
    return "REJECTED" as const;
  }
  if (
    decisions.length > 0 &&
    decisions.every((decision) => decision.status === "APPROVED")
  ) {
    return "APPROVED" as const;
  }
  return "PENDING" as const;
}
