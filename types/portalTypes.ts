import type { ApprovalStatus } from "@/generated/prisma/enums";

export interface PortalDocumentDTO {
  id: string;
  title: string;
  description: string | null;
  status: string;
  clientVisible: boolean;
  currentVersionNumber: number;
  version: number;
  latestVersion: {
    id: string;
    versionNumber: number;
    filename: string;
    contentType: string;
    byteSize: string;
    createdAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}
export interface PortalBillingDTO {
  subscription: {
    planKey: string;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  invoices: Array<{
    id: string;
    number: number;
    customerName: string;
    status: string;
    total: string;
    currency: string;
    dueAt: string | null;
  }>;
}

export interface PortalApprovalDecision {
  status: ApprovalStatus;
}
