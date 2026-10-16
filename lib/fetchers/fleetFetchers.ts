import "server-only";

import { assertPermission } from "@/lib/authz/permissions";
import { withAuthenticatedRead } from "@/lib/db/tenant";

export async function getDrivers(limit = 100) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "fleet:read");
    return tx.driver.findMany({
      where: { organizationId: access.organizationId, archivedAt: null },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { id: "asc" }],
      take: Math.min(Math.max(limit, 1), 200),
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        status: true,
        hiredAt: true,
        version: true,
        updatedAt: true,
      },
    });
  });
}

export async function getDriver(driverId: string) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "fleet:read");
    return tx.driver.findFirst({
      where: { id: driverId, organizationId: access.organizationId, archivedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        status: true,
        hiredAt: true,
        version: true,
        updatedAt: true,
      },
    });
  });
}

export async function getVehicles(limit = 100) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "fleet:read");
    return tx.vehicle.findMany({
      where: { organizationId: access.organizationId, archivedAt: null },
      orderBy: [{ unitNumber: "asc" }, { id: "asc" }],
      take: Math.min(Math.max(limit, 1), 200),
      select: {
        id: true,
        unitNumber: true,
        type: true,
        status: true,
        vin: true,
        plate: true,
        plateState: true,
        make: true,
        model: true,
        year: true,
        version: true,
        updatedAt: true,
      },
    });
  });
}

export async function getVehicle(vehicleId: string) {
  return withAuthenticatedRead(async (tx, access) => {
    assertPermission(access, "fleet:read");
    return tx.vehicle.findFirst({
      where: { id: vehicleId, organizationId: access.organizationId, archivedAt: null },
      select: {
        id: true,
        unitNumber: true,
        type: true,
        status: true,
        vin: true,
        plate: true,
        plateState: true,
        make: true,
        model: true,
        year: true,
        version: true,
        updatedAt: true,
      },
    });
  });
}
