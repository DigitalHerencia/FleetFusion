import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { driverFiltersSchema } from '../schemas/drivers.schema';

export async function getAllDrivers(input: unknown = {}) {
  const { orgId } = await auth.requireOrgContext();
  const filters = driverFiltersSchema.parse(input);
  return prisma.driver.findMany({
    where: {
      organizationId: orgId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.search
        ? {
            OR: [
              { firstName: { contains: filters.search, mode: 'insensitive' as const } },
              { lastName: { contains: filters.search, mode: 'insensitive' as const } },
              { licenseNumber: { contains: filters.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    take: filters.pageSize,
    skip: (filters.page - 1) * filters.pageSize,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDriverById(input: { id: string }) {
  const { orgId } = await auth.requireOrgContext();
  return prisma.driver.findUnique({
    where: { id: input.id, organizationId: orgId },
    include: {
      documents: { include: { file: true, complianceDocument: true } },
      complianceDocuments: { include: { alerts: true } },
      shifts: { orderBy: { startedAt: 'desc' }, take: 30 },
      locationEvents: { orderBy: { recordedAt: 'desc' }, take: 20 },
      loads: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
}

export async function getDriversForDashboard() {
  const { orgId } = await auth.requireOrgContext();
  const drivers = await prisma.driver.findMany({
    where: { organizationId: orgId },
  });
  const complianceDelegate = (
    prisma as unknown as {
      complianceDocument?: {
        findMany: (
          args: unknown,
        ) => Promise<Array<{ driverId: string | null; expirationDate: Date | null }>>;
      };
    }
  ).complianceDocument;
  const documents = complianceDelegate
    ? await complianceDelegate.findMany({
        where: { organizationId: orgId, deletedAt: null, driverId: { not: null } },
      })
    : [];
  const now = new Date();
  const inThirtyDays = new Date(now);
  inThirtyDays.setDate(now.getDate() + 30);
  const expired = documents.filter(
    (document) => document.expirationDate && document.expirationDate < now,
  ).length;
  const expiringSoon = documents.filter(
    (document) =>
      document.expirationDate &&
      document.expirationDate >= now &&
      document.expirationDate <= inThirtyDays,
  ).length;
  return {
    total: drivers.length,
    active: drivers.filter((driver) => driver.status === 'ACTIVE').length,
    inactive: drivers.filter((driver) => driver.status !== 'ACTIVE').length,
    expiredCompliance: expired,
    expiringSoon,
    drivers,
  };
}

export async function getDriverHistory(input: { id: string }) {
  const { orgId } = await auth.requireOrgContext();
  const loads = await prisma.load.findMany({
    where: { driverId: input.id, organizationId: orgId },
    orderBy: { pickupScheduledAt: 'desc' },
  });
  return loads
    .map((load) => ({
      type: 'load' as const,
      occurredAt: load.pickupScheduledAt ?? load.createdAt,
      ...load,
    }))
    .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime());
}
