import type { ApprovalStatus, Prisma } from "@/generated/prisma/client";

import { portalDocumentSelect } from "../selects/portal.selects";
import {
  ConcurrencyConflictError,
  InvariantViolationError,
  ResourceNotFoundError,
} from "./errors";

export async function sharePortalDocumentTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    documentId: string;
    expectedVersion: number;
  },
) {
  const result = await tx.portalDocument.updateMany({
    where: {
      id: input.documentId,
      organizationId: input.organizationId,
      version: input.expectedVersion,
      currentVersionNumber: { gt: 0 },
    },
    data: {
      clientVisible: true,
      status: "PUBLISHED",
      version: { increment: 1 },
    },
  });
  if (result.count !== 1) {
    throw new ConcurrencyConflictError("Portal document");
  }
  return tx.portalDocument.findFirstOrThrow({
    where: { id: input.documentId, organizationId: input.organizationId },
    select: portalDocumentSelect,
  });
}

export async function requestPortalApprovalTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    documentVersionId: string;
    reviewerMembershipId: string;
    reviewerLabel: string;
  },
) {
  const [version, reviewer] = await Promise.all([
    tx.portalDocumentVersion.findFirst({
      where: {
        id: input.documentVersionId,
        organizationId: input.organizationId,
      },
      select: { id: true },
    }),
    tx.membership.findFirst({
      where: {
        id: input.reviewerMembershipId,
        organizationId: input.organizationId,
        status: "ACTIVE",
      },
      select: { id: true },
    }),
  ]);
  if (!version) throw new ResourceNotFoundError("Portal document version");
  if (!reviewer) throw new ResourceNotFoundError("Approval reviewer");
  return tx.portalApproval.upsert({
    where: {
      documentVersionId_reviewerMembershipId: {
        documentVersionId: version.id,
        reviewerMembershipId: reviewer.id,
      },
    },
    create: {
      organizationId: input.organizationId,
      documentVersionId: version.id,
      reviewerMembershipId: reviewer.id,
      reviewerLabel: input.reviewerLabel,
    },
    update: {
      reviewerLabel: input.reviewerLabel,
      status: "PENDING",
      note: null,
      decidedAt: null,
    },
    select: {
      id: true,
      documentVersionId: true,
      reviewerMembershipId: true,
      reviewerLabel: true,
      status: true,
      note: true,
      decidedAt: true,
    },
  });
}

export async function decidePortalApprovalTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    reviewerMembershipId: string;
    approvalId: string;
    decision: Extract<ApprovalStatus, "APPROVED" | "REJECTED">;
    note?: string | null;
  },
) {
  const result = await tx.portalApproval.updateMany({
    where: {
      id: input.approvalId,
      organizationId: input.organizationId,
      reviewerMembershipId: input.reviewerMembershipId,
      status: "PENDING",
    },
    data: {
      status: input.decision,
      note: input.note ?? null,
      decidedAt: new Date(),
    },
  });
  if (result.count !== 1) {
    const exists = await tx.portalApproval.findFirst({
      where: { id: input.approvalId, organizationId: input.organizationId },
      select: { id: true },
    });
    if (!exists) throw new ResourceNotFoundError("Portal approval");
    throw new InvariantViolationError(
      "Only the assigned reviewer can decide a pending approval.",
    );
  }
  return tx.portalApproval.findFirstOrThrow({
    where: { id: input.approvalId, organizationId: input.organizationId },
    select: {
      id: true,
      documentVersionId: true,
      reviewerMembershipId: true,
      reviewerLabel: true,
      status: true,
      note: true,
      decidedAt: true,
    },
  });
}
