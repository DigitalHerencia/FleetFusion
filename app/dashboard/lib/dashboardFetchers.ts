import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { dashboardDateRangeSchema } from '../schemas/dashboard.schema';

type DateRange = {
  from?: Date | string | undefined;
  to?: Date | string | undefined;
};

function normalizeRange(range: DateRange = {}) {
  return dashboardDateRangeSchema.parse(range);
}

function dateFilter(range: { from?: Date | undefined; to?: Date | undefined }) {
  return range.from || range.to
    ? {
        ...(range.from ? { gte: range.from } : {}),
        ...(range.to ? { lte: range.to } : {}),
      }
    : undefined;
}

export async function getFleetOverview(input: DateRange = {}) {
  const { orgId } = await auth.requireOrgContext();
  const range = normalizeRange(input);
  const createdAt = dateFilter(range);
  const [loads, vehicles] = await Promise.all([
    prisma.load.findMany({
      where: { organizationId: orgId, ...(createdAt ? { createdAt } : {}) },
      select: {
        id: true,
        status: true,
        rateCents: true,
        driverId: true,
        vehicleId: true,
        dropoffScheduledAt: true,
        statusEvents: {
          where: { status: 'DELIVERED' },
          orderBy: { occurredAt: 'desc' },
          take: 1,
          select: { occurredAt: true },
        },
      },
    }),
    prisma.vehicle.findMany({
      where: { organizationId: orgId, deletedAt: null },
      select: { id: true, status: true },
    }),
  ]);
  const activeLoads = loads.filter(
    (load) => !['DELIVERED', 'CANCELED'].includes(load.status),
  ).length;
  const deliveredLoads = loads.filter((load) => load.status === 'DELIVERED');
  const onTimeDeliveries = deliveredLoads.filter((load) => {
    const deliveredAt = load.statusEvents[0]?.occurredAt;
    return load.dropoffScheduledAt && deliveredAt && deliveredAt <= load.dropoffScheduledAt;
  }).length;
  const revenueCents = deliveredLoads.reduce((sum, load) => sum + (load.rateCents ?? 0), 0);
  const utilizedVehicles = new Set(
    loads
      .filter((load) => load.vehicleId && !['DELIVERED', 'CANCELED'].includes(load.status))
      .map((load) => load.vehicleId),
  ).size;
  return {
    activeLoads,
    totalLoads: loads.length,
    onTimeDeliveryRate: deliveredLoads.length
      ? Math.round((onTimeDeliveries / deliveredLoads.length) * 100)
      : 0,
    fleetUtilization: vehicles.length ? Math.round((utilizedVehicles / vehicles.length) * 100) : 0,
    revenueCents,
    vehicleCount: vehicles.length,
    activeVehicles: vehicles.filter((vehicle) => vehicle.status === 'ACTIVE').length,
  };
}

export async function getDriverActivitySummary() {
  const { orgId } = await auth.requireOrgContext();
  const drivers = await prisma.driver.findMany({
    where: { organizationId: orgId, deletedAt: null },
    select: { id: true, status: true, shifts: { where: { endedAt: null }, select: { id: true } } },
  });
  return {
    total: drivers.length,
    active: drivers.filter((driver) => driver.status === 'ACTIVE').length,
    inactive: drivers.filter((driver) => driver.status !== 'ACTIVE').length,
    onShift: drivers.filter((driver) => driver.shifts.length > 0).length,
  };
}

export async function getComplianceSnapshot() {
  const { orgId } = await auth.requireOrgContext();
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + 90);
  const documents = await prisma.complianceDocument.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      expirationDate: { lte: horizon },
    },
    include: { driver: true, vehicle: true },
    orderBy: { expirationDate: 'asc' },
  });
  return {
    documents,
    expired: documents.filter(
      (document) => document.expirationDate && document.expirationDate < now,
    ),
    expiringSoon: documents.filter(
      (document) => document.expirationDate && document.expirationDate >= now,
    ),
  };
}

export async function getIftaSummary(input: DateRange = {}) {
  const { orgId } = await auth.requireOrgContext();
  const range = normalizeRange(input);
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const year = now.getFullYear();
  const reportRange = dateFilter(range);
  const where = {
    organizationId: orgId,
    ...(reportRange ? { createdAt: reportRange } : { year, quarter }),
  };
  const reports = await prisma.iftaReport.findMany({
    where,
    orderBy: [{ year: 'desc' }, { quarter: 'desc' }],
    take: 8,
  });
  const summary = reports[0]?.summary;
  const details =
    summary && typeof summary === 'object' && !Array.isArray(summary)
      ? (summary as Record<string, unknown>)
      : {};
  return {
    year: reports[0]?.year ?? year,
    quarter: reports[0]?.quarter ?? quarter,
    reportCount: reports.length,
    status: reports[0]?.status ?? 'DRAFT',
    totalMiles: Number(details['totalMiles'] ?? 0),
    totalGallons: Number(details['totalGallons'] ?? 0),
    taxDueCents: Number(details['taxDueCents'] ?? 0),
    reports,
  };
}

export async function getNotificationDigest(input: { take?: number } = {}) {
  const context = await auth.requireOrgContext();
  const take = Math.min(Math.max(input.take ?? 10, 1), 50);
  const notifications = await prisma.notification.findMany({
    where: {
      organizationId: context.orgId,
      OR: [{ userId: context.userId }, { userId: null }],
      channel: 'IN_APP',
      type: { in: ['ALERT', 'SYSTEM'] },
    },
    orderBy: { createdAt: 'desc' },
    take,
  });
  return {
    notifications,
    unreadCount: notifications.filter((notification) => !notification.readAt).length,
  };
}

export async function getRecentEvents(input: { take?: number } = {}) {
  const { orgId } = await auth.requireOrgContext();
  return prisma.auditLog.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(input.take ?? 10, 1), 50),
  });
}
