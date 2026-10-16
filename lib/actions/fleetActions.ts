"use server";

import {
  archiveDriverSchema,
  archiveVehicleSchema,
  driverInputSchema,
  updateDriverSchema,
  updateVehicleSchema,
  vehicleInputSchema,
} from "@/schemas/fleetSchemas";
import { requireIdentity } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/authz/permissions";
import { invalidatePaths } from "@/lib/cache/invalidate";
import {
  ConcurrencyConflictError,
  InvariantViolationError,
  ResourceNotFoundError,
} from "@/lib/db/transactions/errors";
import { withTenantTransaction } from "@/lib/db/tenant";

const activeLoadStatuses = ["DISPATCHED", "AT_PICKUP", "IN_TRANSIT", "AT_DELIVERY"] as const;

async function assertNoActiveDriverLoads(
  tx: Parameters<Parameters<typeof withTenantTransaction>[1]>[0],
  organizationId: string,
  driverId: string,
) {
  const load = await tx.load.findFirst({
    where: { organizationId, driverId, archivedAt: null, status: { in: [...activeLoadStatuses] } },
    select: { number: true },
  });
  if (load) throw new InvariantViolationError(`Driver cannot be deactivated while load #${load.number} is in progress.`);
}

async function assertNoActiveVehicleLoads(
  tx: Parameters<Parameters<typeof withTenantTransaction>[1]>[0],
  organizationId: string,
  vehicleId: string,
) {
  const load = await tx.load.findFirst({
    where: { organizationId, vehicleId, archivedAt: null, status: { in: [...activeLoadStatuses] } },
    select: { number: true },
  });
  if (load) throw new InvariantViolationError(`Vehicle cannot be taken out of service while load #${load.number} is in progress.`);
}

export async function createDriver(rawInput: unknown) {
  const input = driverInputSchema.parse(rawInput);
  const identity = await requireIdentity();
  const result = await withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "fleet:write");
    const driver = await tx.driver.create({
      data: {
        organizationId: access.organizationId,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone ?? null,
        email: input.email ?? null,
        status: input.status,
        hiredAt: input.hiredAt ?? null,
      },
      select: { id: true, firstName: true, lastName: true, phone: true, email: true, status: true, hiredAt: true, version: true, archivedAt: true },
    });
    await tx.auditEvent.create({
      data: { organizationId: access.organizationId, actorUserId: access.userId, action: "fleet.driver.created", resourceType: "Driver", resourceId: driver.id },
    });
    return driver;
  });
  invalidatePaths(["/drivers", "/dispatch", "/dashboard"]);
  return result;
}

export async function updateDriver(rawInput: unknown) {
  const input = updateDriverSchema.parse(rawInput);
  const identity = await requireIdentity();
  const result = await withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "fleet:write");
    const existing = await tx.driver.findFirst({
      where: { id: input.driverId, organizationId: access.organizationId, archivedAt: null },
      select: { id: true, version: true, status: true },
    });
    if (!existing) throw new ResourceNotFoundError("Driver");
    if (existing.version !== input.expectedVersion) throw new ConcurrencyConflictError("Driver");
    if (input.status !== "ACTIVE" && existing.status === "ACTIVE") {
      await assertNoActiveDriverLoads(tx, access.organizationId, existing.id);
    }
    const changed = await tx.driver.updateMany({
      where: { id: existing.id, organizationId: access.organizationId, archivedAt: null, version: input.expectedVersion },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone ?? null,
        email: input.email ?? null,
        status: input.status,
        hiredAt: input.hiredAt ?? null,
        version: { increment: 1 },
      },
    });
    if (changed.count !== 1) throw new ConcurrencyConflictError("Driver");
    const driver = await tx.driver.findFirstOrThrow({
      where: { id: existing.id, organizationId: access.organizationId, archivedAt: null },
      select: { id: true, firstName: true, lastName: true, phone: true, email: true, status: true, hiredAt: true, version: true, archivedAt: true },
    });
    await tx.auditEvent.create({
      data: { organizationId: access.organizationId, actorUserId: access.userId, action: "fleet.driver.updated", resourceType: "Driver", resourceId: driver.id, metadata: { version: driver.version } },
    });
    return driver;
  });
  invalidatePaths(["/drivers", "/dispatch", "/dashboard"]);
  return result;
}

export async function archiveDriver(rawInput: unknown) {
  const input = archiveDriverSchema.parse(rawInput);
  const identity = await requireIdentity();
  const result = await withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "fleet:write");
    const existing = await tx.driver.findFirst({
      where: { id: input.driverId, organizationId: access.organizationId, archivedAt: null },
      select: { id: true, version: true },
    });
    if (!existing) throw new ResourceNotFoundError("Driver");
    if (existing.version !== input.expectedVersion) throw new ConcurrencyConflictError("Driver");
    await assertNoActiveDriverLoads(tx, access.organizationId, existing.id);
    const changed = await tx.driver.updateMany({
      where: { id: existing.id, organizationId: access.organizationId, archivedAt: null, version: input.expectedVersion },
      data: { status: "INACTIVE", archivedAt: new Date(), version: { increment: 1 } },
    });
    if (changed.count !== 1) throw new ConcurrencyConflictError("Driver");
    await tx.auditEvent.create({
      data: { organizationId: access.organizationId, actorUserId: access.userId, action: "fleet.driver.archived", resourceType: "Driver", resourceId: existing.id },
    });
    return { id: existing.id, archived: true };
  });
  invalidatePaths(["/drivers", "/dispatch", "/dashboard"]);
  return result;
}

export async function createVehicle(rawInput: unknown) {
  const input = vehicleInputSchema.parse(rawInput);
  const identity = await requireIdentity();
  const result = await withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "fleet:write");
    const vehicle = await tx.vehicle.create({
      data: {
        organizationId: access.organizationId,
        unitNumber: input.unitNumber,
        type: input.type,
        status: input.status,
        vin: input.vin ?? null,
        plate: input.plate ?? null,
        plateState: input.plateState ?? null,
        make: input.make ?? null,
        model: input.model ?? null,
        year: input.year ?? null,
      },
      select: { id: true, unitNumber: true, type: true, status: true, vin: true, plate: true, plateState: true, make: true, model: true, year: true, version: true, archivedAt: true },
    });
    await tx.auditEvent.create({
      data: { organizationId: access.organizationId, actorUserId: access.userId, action: "fleet.vehicle.created", resourceType: "Vehicle", resourceId: vehicle.id },
    });
    return vehicle;
  });
  invalidatePaths(["/vehicles", "/dispatch", "/dashboard"]);
  return result;
}

export async function updateVehicle(rawInput: unknown) {
  const input = updateVehicleSchema.parse(rawInput);
  const identity = await requireIdentity();
  const result = await withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "fleet:write");
    const existing = await tx.vehicle.findFirst({
      where: { id: input.vehicleId, organizationId: access.organizationId, archivedAt: null },
      select: { id: true, version: true, status: true },
    });
    if (!existing) throw new ResourceNotFoundError("Vehicle");
    if (existing.version !== input.expectedVersion) throw new ConcurrencyConflictError("Vehicle");
    if (input.status !== "ACTIVE" && existing.status === "ACTIVE") {
      await assertNoActiveVehicleLoads(tx, access.organizationId, existing.id);
    }
    const changed = await tx.vehicle.updateMany({
      where: { id: existing.id, organizationId: access.organizationId, archivedAt: null, version: input.expectedVersion },
      data: {
        unitNumber: input.unitNumber,
        type: input.type,
        status: input.status,
        vin: input.vin ?? null,
        plate: input.plate ?? null,
        plateState: input.plateState ?? null,
        make: input.make ?? null,
        model: input.model ?? null,
        year: input.year ?? null,
        version: { increment: 1 },
      },
    });
    if (changed.count !== 1) throw new ConcurrencyConflictError("Vehicle");
    const vehicle = await tx.vehicle.findFirstOrThrow({
      where: { id: existing.id, organizationId: access.organizationId, archivedAt: null },
      select: { id: true, unitNumber: true, type: true, status: true, vin: true, plate: true, plateState: true, make: true, model: true, year: true, version: true, archivedAt: true },
    });
    await tx.auditEvent.create({
      data: { organizationId: access.organizationId, actorUserId: access.userId, action: "fleet.vehicle.updated", resourceType: "Vehicle", resourceId: vehicle.id, metadata: { version: vehicle.version } },
    });
    return vehicle;
  });
  invalidatePaths(["/vehicles", "/dispatch", "/dashboard"]);
  return result;
}

export async function archiveVehicle(rawInput: unknown) {
  const input = archiveVehicleSchema.parse(rawInput);
  const identity = await requireIdentity();
  const result = await withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "fleet:write");
    const existing = await tx.vehicle.findFirst({
      where: { id: input.vehicleId, organizationId: access.organizationId, archivedAt: null },
      select: { id: true, version: true },
    });
    if (!existing) throw new ResourceNotFoundError("Vehicle");
    if (existing.version !== input.expectedVersion) throw new ConcurrencyConflictError("Vehicle");
    await assertNoActiveVehicleLoads(tx, access.organizationId, existing.id);
    const changed = await tx.vehicle.updateMany({
      where: { id: existing.id, organizationId: access.organizationId, archivedAt: null, version: input.expectedVersion },
      data: { status: "RETIRED", archivedAt: new Date(), version: { increment: 1 } },
    });
    if (changed.count !== 1) throw new ConcurrencyConflictError("Vehicle");
    await tx.auditEvent.create({
      data: { organizationId: access.organizationId, actorUserId: access.userId, action: "fleet.vehicle.archived", resourceType: "Vehicle", resourceId: existing.id },
    });
    return { id: existing.id, archived: true };
  });
  invalidatePaths(["/vehicles", "/dispatch", "/dashboard"]);
  return result;
}
