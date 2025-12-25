'use server';

import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { vehicleFiltersSchema } from '../schemas/vehicles.schema';

/**
 * Fetches a paginated list of vehicles for the current organization, applying optional filters.
 * Filters can include status, type, and a search term (matches VIN, name, make, or model).
 */
export async function getVehicles(filters: unknown = {}) {
  const { orgId } = await auth.requireOrgContext();
  // Validate and normalize filters input
  const parsed = vehicleFiltersSchema.parse(filters);

  // Build Prisma query conditions
  const where: Prisma.VehicleWhereInput = {
    organizationId: orgId,
    deletedAt: null, // only fetch vehicles that are not soft-deleted
    ...(parsed.status !== undefined ? { status: parsed.status } : {}),
    ...(parsed.type !== undefined ? { type: parsed.type } : {}),
    ...(parsed.search
      ? {
          OR: [
            { vin: { contains: parsed.search, mode: 'insensitive' } },
            { name: { contains: parsed.search, mode: 'insensitive' } },
            { make: { contains: parsed.search, mode: 'insensitive' } },
            { model: { contains: parsed.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: parsed['pageSize'],
    skip: (parsed['page'] - 1) * parsed['pageSize'],
  });
  return vehicles;
}

/**
 * Fetches a single vehicle by ID for the current organization, including related documents, inspections, and maintenance records.
 * Returns null if not found or not accessible.
 */
export async function getVehicleById(params: { id: string }) {
  const { orgId } = await auth.requireOrgContext();
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: params.id, organizationId: orgId, deletedAt: null },
    include: {
      documents: true,
      inspections: true,
      maintenanceRecords: true,
    },
  });
  return vehicle;
}

/**
 * Fetches summary counts of vehicles for dashboard display (total count, active count, in-shop count).
 */
export async function getVehiclesForDashboard() {
  const { orgId } = await auth.requireOrgContext();
  const where = { organizationId: orgId, deletedAt: null } as const;

  const [total, active, inShop] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.count({ where: { ...where, status: 'ACTIVE' } }),
    prisma.vehicle.count({ where: { ...where, status: 'IN_SHOP' } }),
  ]);

  return { total, active, inShop };
}

/**
 * Retrieves a chronological history of events for a vehicle, combining maintenance records and load assignments.
 * Returns an array of events sorted by occurredAt descending, with type discriminators.
 */
export async function getVehicleHistory(params: { id: string }) {
  const { orgId } = await auth.requireOrgContext();
  // Fetch maintenance records and loads for the vehicle
  const maintenance = await prisma.vehicleMaintenance.findMany({
    where: { vehicleId: params.id, organizationId: orgId },
    orderBy: { performedAt: 'desc' },
  });
  const loads = await prisma.load.findMany({
    where: { vehicleId: params.id, organizationId: orgId },
    orderBy: { pickupScheduledAt: 'desc' },
  });

  // Merge and sort events by date (newest first)
  const merged = [
    ...maintenance.map((m) => ({
      type: 'maintenance' as const,
      occurredAt: m.performedAt,
      id: m.id,
      description: m.description,
    })),
    ...loads.map((l) => ({
      type: 'load' as const,
      occurredAt: l.pickupScheduledAt ?? l.createdAt,
      id: l.id,
      status: l.status,
      reference: l.reference,
    })),
  ].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  return merged;
}
