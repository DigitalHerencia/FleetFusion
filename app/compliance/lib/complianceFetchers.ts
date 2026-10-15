import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { complianceFiltersSchema } from '../schemas/compliance.schema';

export async function getAllComplianceDocuments(input: unknown = {}) {
  const { orgId } = await auth.requireOrgContext();
  const filters = complianceFiltersSchema.parse(input);
  return prisma.complianceDocument.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.vehicleId ? { vehicleId: filters.vehicleId } : {}),
      ...(filters.driverId ? { driverId: filters.driverId } : {}),
    },
    take: filters.pageSize,
    skip: (filters.page - 1) * filters.pageSize,
    orderBy: { expirationDate: 'asc' },
    include: { vehicle: true, driver: true, file: true },
  });
}

export async function getComplianceDocumentById(input: { id: string }) {
  const { orgId } = await auth.requireOrgContext();
  if (!input?.id) return null;
  const document = await prisma.complianceDocument.findUnique({
    where: { id: input.id, organizationId: orgId, deletedAt: null },
    include: { vehicle: true, driver: true, file: true, alerts: true },
  });
  if (!document) return null;

  const auditLogModel = (prisma as unknown as Record<string, any>)['auditLog'];
  const auditLogs =
    typeof auditLogModel?.findMany === 'function'
      ? await auditLogModel.findMany({
          where: {
            organizationId: orgId,
            entityType: 'ComplianceDocument',
            entityId: input.id,
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];
  return { ...document, auditLogs };
}

export async function getComplianceSummary() {
  const { orgId } = await auth.requireOrgContext();
  const documents = await prisma.complianceDocument.findMany({
    where: { organizationId: orgId },
  });
  const activeDocuments = documents.filter((document) => document.deletedAt == null);
  const now = Date.now();
  const dueThreshold = now + 30 * 24 * 60 * 60 * 1000;
  const vehicles = new Set(
    activeDocuments.flatMap((item) => (item.vehicleId ? [item.vehicleId] : [])),
  );
  const drivers = new Set(
    activeDocuments.flatMap((item) => (item.driverId ? [item.driverId] : [])),
  );
  return {
    total: activeDocuments.length,
    valid: activeDocuments.filter((item) => item.status === 'VALID').length,
    expiring: activeDocuments.filter(
      (item) =>
        item.status === 'EXPIRING_SOON' ||
        (item.expirationDate &&
          new Date(item.expirationDate).getTime() >= now &&
          new Date(item.expirationDate).getTime() <= dueThreshold),
    ).length,
    expired: activeDocuments.filter(
      (item) =>
        item.status === 'EXPIRED' ||
        (item.expirationDate && new Date(item.expirationDate).getTime() < now),
    ).length,
    exempt: activeDocuments.filter((item) => item.status === 'EXEMPT').length,
    vehicles: vehicles.size,
    drivers: drivers.size,
  };
}

export async function getExpirationAlerts(
  input: { state?: 'overdue' | 'upcoming' | 'all'; thresholdDays?: number } = {},
) {
  const { orgId } = await auth.requireOrgContext();
  const now = new Date();
  const threshold = new Date(
    now.getTime() + Math.max(0, Math.min(365, input.thresholdDays ?? 30)) * 24 * 60 * 60 * 1000,
  );
  const filter =
    input.state === 'overdue'
      ? { expirationDate: { lt: now } }
      : input.state === 'upcoming'
        ? { expirationDate: { gte: now, lte: threshold } }
        : { expirationDate: { lte: threshold } };
  return prisma.complianceDocument.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      status: { not: 'EXEMPT' },
      ...filter,
    },
    orderBy: { expirationDate: 'asc' },
    include: { vehicle: true, driver: true, alerts: { where: { resolvedAt: null } } },
  });
}

export async function getRelatedVehicleAndDriverData(input: {
  vehicleIds?: string[];
  driverIds?: string[];
}) {
  const { orgId } = await auth.requireOrgContext();
  const [vehicles, drivers] = await Promise.all([
    input.vehicleIds?.length
      ? prisma.vehicle.findMany({
          where: { id: { in: input.vehicleIds }, organizationId: orgId },
        })
      : Promise.resolve([]),
    input.driverIds?.length
      ? prisma.driver.findMany({
          where: { id: { in: input.driverIds }, organizationId: orgId },
        })
      : Promise.resolve([]),
  ]);
  return { vehicles, drivers };
}
