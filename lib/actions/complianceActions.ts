"use server";

import {
  archiveComplianceItemSchema,
  complianceItemInputSchema,
  updateComplianceItemSchema,
} from "@/schemas/complianceSchemas";
import { requireIdentity } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/authz/permissions";
import { invalidatePaths } from "@/lib/cache/invalidate";
import {
  ConcurrencyConflictError,
  ResourceNotFoundError,
} from "@/lib/db/transactions/errors";
import { withTenantTransaction } from "@/lib/db/tenant";
import type { Prisma } from "@/generated/prisma/client";

async function validateComplianceReferences(
  tx: Prisma.TransactionClient,
  organizationId: string,
  input: { subjectType: "ORGANIZATION" | "DRIVER" | "VEHICLE"; driverId?: string | null; vehicleId?: string | null; assetId?: string | null },
) {
  if (input.subjectType === "DRIVER") {
    if (!input.driverId) throw new ResourceNotFoundError("Driver");
    const driver = await tx.driver.findFirst({
      where: { id: input.driverId!, organizationId, archivedAt: null },
      select: { id: true },
    });
    if (!driver) throw new ResourceNotFoundError("Driver");
  }
  if (input.subjectType === "VEHICLE") {
    if (!input.vehicleId) throw new ResourceNotFoundError("Vehicle");
    const vehicle = await tx.vehicle.findFirst({
      where: { id: input.vehicleId!, organizationId, archivedAt: null },
      select: { id: true },
    });
    if (!vehicle) throw new ResourceNotFoundError("Vehicle");
  }
  if (input.assetId) {
    const asset = await tx.asset.findFirst({
      where: { id: input.assetId, organizationId },
      select: { id: true },
    });
    if (!asset) throw new ResourceNotFoundError("Compliance document file");
  }
}

export async function createComplianceItem(rawInput: unknown) {
  const input = complianceItemInputSchema.parse(rawInput);
  const identity = await requireIdentity();
  const result = await withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "compliance:write");
    await validateComplianceReferences(tx, access.organizationId, input);
    const item = await tx.complianceItem.create({
      data: {
        organizationId: access.organizationId,
        subjectType: input.subjectType,
        driverId: input.subjectType === "DRIVER" ? input.driverId! : null,
        vehicleId: input.subjectType === "VEHICLE" ? input.vehicleId! : null,
        type: input.type,
        title: input.title ?? null,
        referenceNumber: input.referenceNumber ?? null,
        issuedAt: input.issuedAt ?? null,
        expiresAt: input.expiresAt ?? null,
        assetId: input.assetId ?? null,
      },
      select: { id: true, subjectType: true, driverId: true, vehicleId: true, type: true, title: true, referenceNumber: true, issuedAt: true, expiresAt: true, assetId: true, version: true },
    });
    await tx.auditEvent.create({
      data: { organizationId: access.organizationId, actorUserId: access.userId, action: "compliance.item.created", resourceType: "ComplianceItem", resourceId: item.id },
    });
    return item;
  });
  invalidatePaths(["/compliance", "/dashboard", "/dispatch"]);
  return result;
}

export async function updateComplianceItem(rawInput: unknown) {
  const input = updateComplianceItemSchema.parse(rawInput);
  const identity = await requireIdentity();
  const result = await withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "compliance:write");
    const existing = await tx.complianceItem.findFirst({
      where: { id: input.complianceItemId, organizationId: access.organizationId, archivedAt: null },
      select: { id: true, version: true },
    });
    if (!existing) throw new ResourceNotFoundError("Compliance item");
    if (existing.version !== input.expectedVersion) throw new ConcurrencyConflictError("Compliance item");
    await validateComplianceReferences(tx, access.organizationId, input);
    const changed = await tx.complianceItem.updateMany({
      where: { id: existing.id, organizationId: access.organizationId, archivedAt: null, version: input.expectedVersion },
      data: {
        subjectType: input.subjectType,
        driverId: input.subjectType === "DRIVER" ? input.driverId! : null,
        vehicleId: input.subjectType === "VEHICLE" ? input.vehicleId! : null,
        type: input.type,
        title: input.title ?? null,
        referenceNumber: input.referenceNumber ?? null,
        issuedAt: input.issuedAt ?? null,
        expiresAt: input.expiresAt ?? null,
        assetId: input.assetId ?? null,
        version: { increment: 1 },
      },
    });
    if (changed.count !== 1) throw new ConcurrencyConflictError("Compliance item");
    const item = await tx.complianceItem.findFirstOrThrow({
      where: { id: existing.id, organizationId: access.organizationId, archivedAt: null },
      select: { id: true, subjectType: true, driverId: true, vehicleId: true, type: true, title: true, referenceNumber: true, issuedAt: true, expiresAt: true, assetId: true, version: true },
    });
    await tx.auditEvent.create({
      data: { organizationId: access.organizationId, actorUserId: access.userId, action: "compliance.item.updated", resourceType: "ComplianceItem", resourceId: item.id, metadata: { version: item.version } },
    });
    return item;
  });
  invalidatePaths(["/compliance", "/dashboard", "/dispatch"]);
  return result;
}

export async function archiveComplianceItem(rawInput: unknown) {
  const input = archiveComplianceItemSchema.parse(rawInput);
  const identity = await requireIdentity();
  const result = await withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "compliance:write");
    const changed = await tx.complianceItem.updateMany({
      where: { id: input.complianceItemId, organizationId: access.organizationId, archivedAt: null, version: input.expectedVersion },
      data: { archivedAt: new Date(), version: { increment: 1 } },
    });
    if (changed.count !== 1) {
      const exists = await tx.complianceItem.findFirst({
        where: { id: input.complianceItemId, organizationId: access.organizationId, archivedAt: null },
        select: { id: true },
      });
      if (!exists) throw new ResourceNotFoundError("Compliance item");
      throw new ConcurrencyConflictError("Compliance item");
    }
    await tx.auditEvent.create({
      data: { organizationId: access.organizationId, actorUserId: access.userId, action: "compliance.item.archived", resourceType: "ComplianceItem", resourceId: input.complianceItemId },
    });
    return { id: input.complianceItemId, archived: true };
  });
  invalidatePaths(["/compliance", "/dashboard", "/dispatch"]);
  return result;
}
