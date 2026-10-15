"use server";

import {
  advanceLoadStatusSchema,
  assignLoadSchema,
  createLoadSchema,
} from "@/schemas/dispatchSchemas";
import { requireIdentity } from "@/lib/auth/auth";
import { assertPermission } from "@/lib/authz/permissions";
import { invalidatePaths } from "@/lib/cache/invalidate";
import { canTransitionLoad } from "@/lib/constants/dispatch";
import { toLoadSummaryDTO } from "@/lib/db/dto/dispatch.dto";
import { loadSummarySelect } from "@/lib/db/selects/dispatch.selects";
import { withTenantTransaction } from "@/lib/db/tenant";
import {
  ConcurrencyConflictError,
  InvariantViolationError,
  ResourceNotFoundError,
} from "@/lib/db/transactions/errors";

export async function createLoad(rawInput: unknown) {
  const input = createLoadSchema.parse(rawInput);
  const identity = await requireIdentity();
  const result = await withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "dispatch:write");

    if (input.customerAccountId) {
      const customer = await tx.crmAccount.findFirst({
        where: { id: input.customerAccountId, organizationId: access.organizationId },
        select: { id: true },
      });
      if (!customer) throw new ResourceNotFoundError("Customer");
    }

    const last = await tx.load.aggregate({
      where: { organizationId: access.organizationId },
      _max: { number: true },
    });
    const number = (last._max.number ?? 1000) + 1;

    const record = await tx.load.create({
      data: {
        organizationId: access.organizationId,
        customerAccountId: input.customerAccountId ?? null,
        number,
        referenceNumber: input.referenceNumber ?? null,
        rate: input.rate.toFixed(2),
        miles: input.miles ?? null,
        notes: input.notes ?? null,
        stops: {
          create: input.stops.map((s, i) => ({
            organizationId: access.organizationId,
            sequence: i + 1,
            type: s.type,
            locationName: s.locationName ?? null,
            address1: s.address1 ?? null,
            city: s.city,
            state: s.state,
            postalCode: s.postalCode ?? null,
            windowStart: s.windowStart ?? null,
            windowEnd: s.windowEnd ?? null,
          })),
        },
      },
      select: loadSummarySelect,
    });

    await tx.auditEvent.create({
      data: {
        organizationId: access.organizationId,
        actorUserId: access.userId,
        action: "load.created",
        resourceType: "Load",
        resourceId: record.id,
      },
    });
    return toLoadSummaryDTO(record);
  });
  invalidatePaths(["/dispatch", "/dashboard"]);
  return result;
}

export async function assignLoad(rawInput: unknown) {
  const input = assignLoadSchema.parse(rawInput);
  const identity = await requireIdentity();
  const result = await withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "dispatch:write");

    if (input.driverId) {
      const driver = await tx.driver.findFirst({
        where: { id: input.driverId, organizationId: access.organizationId, status: "ACTIVE", archivedAt: null },
        select: { id: true },
      });
      if (!driver) throw new ResourceNotFoundError("Driver");
    }
    if (input.vehicleId) {
      const vehicle = await tx.vehicle.findFirst({
        where: { id: input.vehicleId, organizationId: access.organizationId, status: "ACTIVE", archivedAt: null },
        select: { id: true },
      });
      if (!vehicle) throw new ResourceNotFoundError("Vehicle");
    }

    const updated = await tx.load.updateMany({
      where: {
        id: input.loadId,
        organizationId: access.organizationId,
        version: input.expectedVersion,
        status: { in: ["DRAFT", "BOOKED", "DISPATCHED"] },
      },
      data: {
        driverId: input.driverId,
        vehicleId: input.vehicleId,
        version: { increment: 1 },
      },
    });
    if (updated.count !== 1) throw new ConcurrencyConflictError("Load");

    await tx.auditEvent.create({
      data: {
        organizationId: access.organizationId,
        actorUserId: access.userId,
        action: "load.assigned",
        resourceType: "Load",
        resourceId: input.loadId,
      },
    });
    return toLoadSummaryDTO(
      await tx.load.findFirstOrThrow({
        where: { id: input.loadId, organizationId: access.organizationId },
        select: loadSummarySelect,
      }),
    );
  });
  invalidatePaths(["/dispatch", `/dispatch/${input.loadId}`]);
  return result;
}

export async function advanceLoadStatus(rawInput: unknown) {
  const input = advanceLoadStatusSchema.parse(rawInput);
  const identity = await requireIdentity();
  const result = await withTenantTransaction(identity, async (tx, access) => {
    assertPermission(access, "dispatch:write");

    const current = await tx.load.findFirst({
      where: { id: input.loadId, organizationId: access.organizationId, archivedAt: null },
      select: { status: true, driverId: true, vehicleId: true, version: true },
    });
    if (!current) throw new ResourceNotFoundError("Load");
    if (!canTransitionLoad(current.status, input.status)) {
      throw new InvariantViolationError(`A ${current.status} load cannot move to ${input.status}.`);
    }
    if (input.status === "DISPATCHED" && (!current.driverId || !current.vehicleId)) {
      throw new InvariantViolationError("Assign a driver and a truck before dispatching.");
    }

    const updated = await tx.load.updateMany({
      where: { id: input.loadId, organizationId: access.organizationId, version: input.expectedVersion },
      data: {
        status: input.status,
        deliveredAt: input.status === "DELIVERED" ? new Date() : undefined,
        version: { increment: 1 },
      },
    });
    if (updated.count !== 1) throw new ConcurrencyConflictError("Load");

    await tx.auditEvent.create({
      data: {
        organizationId: access.organizationId,
        actorUserId: access.userId,
        action: `load.${input.status.toLowerCase()}`,
        resourceType: "Load",
        resourceId: input.loadId,
      },
    });
    return toLoadSummaryDTO(
      await tx.load.findFirstOrThrow({
        where: { id: input.loadId, organizationId: access.organizationId },
        select: loadSummarySelect,
      }),
    );
  });
  invalidatePaths(["/dispatch", `/dispatch/${input.loadId}`, "/dashboard"]);
  return result;
}