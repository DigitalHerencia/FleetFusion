import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { loadFiltersSchema } from '../schemas/dispatch.schema';

export async function getAllLoads(input: unknown = {}) {
  const { orgId } = await auth.requireOrgContext();
  const filters = loadFiltersSchema.parse(input);
  const where = {
    organizationId: orgId,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search
      ? {
          OR: [
            { reference: { contains: filters.search, mode: 'insensitive' as const } },
            { pickupCity: { contains: filters.search, mode: 'insensitive' as const } },
            { dropoffCity: { contains: filters.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };
  return prisma.load.findMany({
    where,
    take: filters.pageSize,
    skip: (filters.page - 1) * filters.pageSize,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getLoadById(input: { id: string }) {
  const { orgId } = await auth.requireOrgContext();
  return prisma.load.findUnique({
    where: { id: input.id, organizationId: orgId },
    include: {
      driver: true,
      vehicle: true,
      assignments: { include: { driver: true, vehicle: true } },
      statusEvents: { orderBy: { occurredAt: 'asc' } },
    },
  });
}

export async function getDispatchBoardData() {
  const { orgId } = await auth.requireOrgContext();
  const [loads, drivers] = await Promise.all([
    prisma.load.findMany({ where: { organizationId: orgId } }),
    prisma.driver.findMany({ where: { organizationId: orgId } }),
  ]);
  const statuses = [
    'DRAFT',
    'PLANNED',
    'ASSIGNED',
    'AT_PICKUP',
    'IN_TRANSIT',
    'AT_DROPOFF',
    'DELIVERED',
    'CANCELED',
  ] as const;
  const columns = statuses.map((status) => ({
    status,
    loads: loads.filter((load) => load.status === status),
  }));
  return { columns, loads, drivers };
}

export async function getDriverAssignments() {
  const { orgId } = await auth.requireOrgContext();
  const loads = await prisma.load.findMany({
    where: { organizationId: orgId },
  });
  const byDriver = new Map<string, typeof loads>();
  for (const load of loads) {
    if (!load.driverId) continue;
    const assignments = byDriver.get(load.driverId) ?? [];
    assignments.push(load);
    byDriver.set(load.driverId, assignments);
  }
  return [...byDriver].map(([driverId, driverLoads]) => ({ driverId, loads: driverLoads }));
}

export async function getLoadHistory(input: { id: string }) {
  const { orgId } = await auth.requireOrgContext();
  const client = prisma as unknown as {
    loadStatusEvent?: {
      findMany: (
        args: unknown,
      ) => Promise<Array<{ id: string; occurredAt: Date; status: string; notes: string | null }>>;
    };
    loadEvent?: {
      findMany: (
        args: unknown,
      ) => Promise<Array<{ id: string; occurredAt: Date; status: string; notes: string | null }>>;
    };
  };
  const events = client.loadStatusEvent ?? client.loadEvent;
  if (!events) return [];
  return events.findMany({
    where: { loadId: input.id, organizationId: orgId },
    orderBy: { occurredAt: 'asc' },
  });
}
