'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { vehicleFiltersSchema } from '../schemas/vehicles.schema';

export async function getVehicles(filters: unknown = {}) {
  const { orgId } = await auth.requireOrgContext();
  const parsed = vehicleFiltersSchema.parse(filters);

  const where = {
    organizationId: orgId,
    status: parsed.status,
    type: parsed.type,
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
    take: parsed.pageSize,
    skip: (parsed.page - 1) * parsed.pageSize,
  });

  return vehicles;
}

export async function getVehicleById(params: { id: string }) {
  const { orgId } = await auth.requireOrgContext();

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: params.id, organizationId: orgId },
    include: {
      documents: true,
      inspections: true,
      maintenanceRecords: true,
    },
  });

  return vehicle;
}

export async function getVehiclesForDashboard() {
  const { orgId } = await auth.requireOrgContext();

  const vehicles = await prisma.vehicle.findMany({ where: { organizationId: orgId } });

  const total = vehicles.length;
  const active = vehicles.filter((v) => v.status === 'ACTIVE').length;
  const inShop = vehicles.filter((v) => v.status === 'IN_SHOP').length;

  return { total, active, inShop };
}

export async function getVehicleHistory(params: { id: string }) {
  const { orgId } = await auth.requireOrgContext();

  const maintenance = await prisma.vehicleMaintenance.findMany({
    where: { vehicleId: params.id, organizationId: orgId },
    orderBy: { performedAt: 'desc' },
  });

  const loads = await prisma.load.findMany({
    where: { vehicleId: params.id, organizationId: orgId },
    orderBy: { pickupScheduledAt: 'desc' },
  });

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
