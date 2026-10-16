import "server-only";

import { assertPermission, hasPermission } from "@/lib/authz/permissions";
import { withAuthenticatedRead } from "@/lib/db/tenant";

export async function getComplianceItems(limit = 200) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "compliance:read");
    return tx.complianceItem.findMany({
      where: { organizationId: access.organizationId, archivedAt: null },
      orderBy: [{ expiresAt: "asc" }, { createdAt: "desc" }],
      take: Math.min(Math.max(limit, 1), 300),
      select: {
        id: true,
        subjectType: true,
        type: true,
        title: true,
        referenceNumber: true,
        issuedAt: true,
        expiresAt: true,
        assetId: true,
        version: true,
        driver: { select: { id: true, firstName: true, lastName: true } },
        vehicle: { select: { id: true, unitNumber: true } },
        asset: { select: { id: true, filename: true } },
      },
    });
  });
}

export async function getComplianceAssets() {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "compliance:read");
    return tx.asset.findMany({
      where: { organizationId: access.organizationId },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, filename: true, contentType: true, byteSize: true },
    });
  });
}

export async function getComplianceWriteAccess() {
  return withAuthenticatedRead(async (_tx, access) =>
    hasPermission(access, "compliance:write"),
  );
}

export async function getComplianceFormOptions() {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "compliance:write");
    const [drivers, vehicles, assets] = await Promise.all([
      tx.driver.findMany({
        where: { organizationId: access.organizationId, archivedAt: null },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        select: { id: true, firstName: true, lastName: true, status: true },
      }),
      tx.vehicle.findMany({
        where: { organizationId: access.organizationId, archivedAt: null },
        orderBy: { unitNumber: "asc" },
        select: { id: true, unitNumber: true, status: true },
      }),
      tx.asset.findMany({
        where: { organizationId: access.organizationId },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: { id: true, filename: true },
      }),
    ]);
    return { drivers, vehicles, assets };
  });
}

export async function getComplianceItem(complianceItemId: string) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "compliance:write");
    return tx.complianceItem.findFirst({
      where: { id: complianceItemId, organizationId: access.organizationId, archivedAt: null },
      select: {
        id: true,
        subjectType: true,
        driverId: true,
        vehicleId: true,
        type: true,
        title: true,
        referenceNumber: true,
        issuedAt: true,
        expiresAt: true,
        assetId: true,
        version: true,
      },
    });
  });
}
