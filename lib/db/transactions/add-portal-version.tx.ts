import type { Prisma } from "../../../generated/prisma/client";

import { portalDocumentSelect } from "../selects/portal.selects";
import { ConcurrencyConflictError, ResourceNotFoundError } from "./errors";

export async function addPortalVersionTx(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    membershipId: string;
    documentId: string;
    assetId: string;
    notes?: string | null;
    expectedVersion: number;
  },
) {
  const document = await tx.portalDocument.findFirst({
    where: {
      id: input.documentId,
      organizationId: input.organizationId,
      version: input.expectedVersion,
    },
    select: {
      id: true,
      currentVersionNumber: true,
    },
  });

  if (!document) {
    throw new ConcurrencyConflictError("Portal document");
  }

  const asset = await tx.asset.findFirst({
    where: {
      id: input.assetId,
      organizationId: input.organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!asset) {
    throw new ResourceNotFoundError("Asset");
  }

  const nextVersion = document.currentVersionNumber + 1;

  await tx.portalDocumentVersion.create({
    data: {
      organizationId: input.organizationId,
      documentId: input.documentId,
      assetId: input.assetId,
      uploadedByMembershipId: input.membershipId,
      versionNumber: nextVersion,
      notes: input.notes ?? null,
    },
  });

  const result = await tx.portalDocument.updateMany({
    where: {
      id: input.documentId,
      organizationId: input.organizationId,
      version: input.expectedVersion,
    },
    data: {
      currentVersionNumber: nextVersion,
      status: "IN_REVIEW",
      version: {
        increment: 1,
      },
    },
  });

  if (result.count !== 1) {
    throw new ConcurrencyConflictError("Portal document");
  }

  return tx.portalDocument.findFirstOrThrow({
    where: {
      id: input.documentId,
      organizationId: input.organizationId,
    },
    select: portalDocumentSelect,
  });
}
