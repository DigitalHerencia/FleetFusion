"use server";

import {
  portalDocumentCommandSchema,
  addPortalDocumentVersionSchema,
  createPortalDocumentSchema,
} from "@/schemas/portalSchemas";
import { requireIdentity } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/authz/permissions";
import { toPortalDocumentDTO } from "@/lib/db/dto/portal.dto";
import { portalDocumentSelect } from "@/lib/db/selects/portal.selects";
import { withTenantTransaction } from "@/lib/db/tenant";
import { downloadWorkspaceFileWorkflow } from "@/lib/workflows/assetWorkflows";
import { sharePortalDocumentTx } from "@/lib/db/transactions/portal.tx";
import { addPortalVersionTx } from "@/lib/db/transactions/add-portal-version.tx";

export async function createPortalDocument(rawInput: unknown) {
  const input = createPortalDocumentSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "portal:write");
    const record = await tx.portalDocument.create({
      data: {
        organizationId: access.organizationId,
        title: input.title,
        description: input.description ?? null,
        clientVisible: input.clientVisible,
      },
      select: portalDocumentSelect,
    });
    return toPortalDocumentDTO(record);
  });
}

export async function addPortalDocumentVersion(rawInput: unknown) {
  const input = addPortalDocumentVersionSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "portal:write");
    const record = await addPortalVersionTx(tx, {
      organizationId: access.organizationId,
      membershipId: access.membershipId,
      documentId: input.documentId,
      assetId: input.assetId,
      notes: input.notes ?? null,
      expectedVersion: input.expectedVersion,
    });
    return toPortalDocumentDTO(record);
  });
}

export async function sharePortalDocument(rawInput: unknown) {
  const input = portalDocumentCommandSchema.parse(rawInput);
  const identity = await requireIdentity();
  return withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "portal:write");
    return toPortalDocumentDTO(
      await sharePortalDocumentTx(tx, {
        ...input,
        organizationId: access.organizationId,
      }),
    );
  });
}
export async function downloadPortalDocument(rawInput: unknown) {
  const { documentId } = portalDocumentCommandSchema
    .pick({ documentId: true })
    .parse(rawInput);
  const identity = await requireIdentity();
  const asset = await withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "portal:read");
    const document = await tx.portalDocument.findFirst({
      where: {
        id: documentId,
        organizationId: access.organizationId,
        ...(access.role === "CLIENT"
          ? { clientVisible: true, status: { not: "ARCHIVED" as const } }
          : {}),
      },
      select: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
          select: {
            asset: {
              select: {
                storageProvider: true,
                storageKey: true,
                filename: true,
                byteSize: true,
              },
            },
          },
        },
      },
    });
    const asset = document?.versions[0]?.asset;
    if (!asset) throw new Error("File not found.");
    if (asset.storageProvider !== "vercel-blob" || asset.byteSize > 10485760n)
      throw new Error("This file cannot be downloaded through this workspace.");
    return asset;
  });
  return {
    filename: asset.filename,
    base64: await downloadWorkspaceFileWorkflow(asset),
  };
}
