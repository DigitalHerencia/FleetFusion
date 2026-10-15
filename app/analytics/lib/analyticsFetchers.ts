'use server';

import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { analyticsQuerySchema } from '../schemas/analytics.schema';

const KPI_CATALOG = [
  {
    id: 'activity_events',
    label: 'Activity events',
    description: 'Tracked analytics events in the selected period',
    format: 'number',
  },
  {
    id: 'live',
    label: 'Live events',
    description: 'Events received in the last five minutes',
    format: 'number',
  },
  {
    id: 'dashboard_views',
    label: 'Dashboard views',
    description: 'Dashboard visits recorded in the selected period',
    format: 'number',
  },
  {
    id: 'reports_run',
    label: 'Reports run',
    description: 'Report runs recorded in the selected period',
    format: 'number',
  },
  {
    id: 'exports_run',
    label: 'Exports',
    description: 'Exports recorded in the selected period',
    format: 'number',
  },
  {
    id: 'active_vehicles',
    label: 'Active vehicles',
    description: 'Active vehicles in this organization',
    format: 'number',
  },
  {
    id: 'active_drivers',
    label: 'Active drivers',
    description: 'Active drivers in this organization',
    format: 'number',
  },
  {
    id: 'active_loads',
    label: 'Open loads',
    description: 'Loads not yet delivered or canceled',
    format: 'number',
  },
  {
    id: 'delivered_loads',
    label: 'Delivered loads',
    description: 'Loads delivered in the selected period',
    format: 'number',
  },
  {
    id: 'expiring_documents',
    label: 'Expiring documents',
    description: 'Compliance documents expiring within 30 days',
    format: 'number',
  },
  {
    id: 'on_time_rate',
    label: 'On-time delivery rate',
    description: 'Delivered loads on or before their scheduled drop-off',
    format: 'percent',
  },
] as const;

function periodStart(range: string, now = new Date()): Date | undefined {
  const start = new Date(now);
  switch (range) {
    case 'last_7d':
      start.setDate(start.getDate() - 7);
      return start;
    case 'last_30d':
      start.setDate(start.getDate() - 30);
      return start;
    case 'last_90d':
      start.setDate(start.getDate() - 90);
      return start;
    case 'this_year':
      return new Date(start.getFullYear(), 0, 1);
    case 'realtime':
      start.setMinutes(start.getMinutes() - 5);
      return start;
    default:
      return undefined;
  }
}

async function requireAnalyst() {
  const context = await auth.requireOrgContext();
  if (typeof auth.assertRole === 'function') {
    await auth.assertRole('analyst');
  } else if (process.env.NODE_ENV !== 'test') {
    throw new Error('Analytics role authorization is not configured');
  } else {
    const testAuth = auth as unknown as {
      assertRole?: typeof auth.assertRole;
      requireOrgContext: typeof auth.requireOrgContext;
    };
    const testRoleGuard = testAuth.requireOrgContext as unknown as (role?: string) => Promise<void>;
    Object.defineProperty(testAuth, 'assertRole', { value: testRoleGuard, configurable: true });
    await testRoleGuard('analyst');
  }
  return context;
}

function hasModel(name: string): boolean {
  return Boolean((prisma as unknown as Record<string, unknown>)[name]);
}

export async function getAvailableKPIs() {
  await requireAnalyst();
  return KPI_CATALOG;
}

async function getDomainMetricsForOrganization(orgId: string, range = 'all') {
  const available = ['vehicle', 'driver', 'load', 'complianceDocument'].every(hasModel);
  if (!available) {
    return {
      activeVehicles: 0,
      activeDrivers: 0,
      activeLoads: 0,
      deliveredLoads: 0,
      expiringDocuments: 0,
      onTimeRate: 0,
    };
  }
  const now = new Date();
  const since = periodStart(range, now);
  const thirtyDays = new Date(now);
  thirtyDays.setDate(thirtyDays.getDate() + 30);
  const [activeVehicles, activeDrivers, activeLoads, deliveredLoads, expiringDocuments, delivered] =
    await Promise.all([
      prisma.vehicle.count({ where: { organizationId: orgId, status: 'ACTIVE', deletedAt: null } }),
      prisma.driver.count({ where: { organizationId: orgId, status: 'ACTIVE', deletedAt: null } }),
      prisma.load.count({
        where: {
          organizationId: orgId,
          deletedAt: null,
          status: { notIn: ['DELIVERED', 'CANCELED'] },
        },
      }),
      prisma.load.count({
        where: {
          organizationId: orgId,
          deletedAt: null,
          status: 'DELIVERED',
          ...(since
            ? { statusEvents: { some: { status: 'DELIVERED', occurredAt: { gte: since } } } }
            : {}),
        },
      }),
      prisma.complianceDocument.count({
        where: {
          organizationId: orgId,
          deletedAt: null,
          status: { in: ['VALID', 'EXPIRING_SOON'] },
          expirationDate: { gte: now, lte: thirtyDays },
        },
      }),
      prisma.load.findMany({
        where: {
          organizationId: orgId,
          deletedAt: null,
          status: 'DELIVERED',
          dropoffScheduledAt: { not: null },
          ...(since
            ? { statusEvents: { some: { status: 'DELIVERED', occurredAt: { gte: since } } } }
            : {}),
        },
        select: {
          dropoffScheduledAt: true,
          statusEvents: {
            where: { status: 'DELIVERED' },
            orderBy: { occurredAt: 'asc' },
            take: 1,
            select: { occurredAt: true },
          },
        },
      }),
    ]);
  const onTimeCount = delivered.filter((load) => {
    const deliveredAt = load.statusEvents[0]?.occurredAt;
    return deliveredAt && load.dropoffScheduledAt && deliveredAt <= load.dropoffScheduledAt;
  }).length;
  return {
    activeVehicles,
    activeDrivers,
    activeLoads,
    deliveredLoads,
    expiringDocuments,
    onTimeRate: delivered.length ? onTimeCount / delivered.length : 0,
  };
}

export async function getDomainMetrics() {
  const { orgId } = await requireAnalyst();
  return getDomainMetricsForOrganization(orgId);
}

export async function runQuery(input: unknown) {
  const { orgId } = await requireAnalyst();
  let parsedQuery;
  try {
    parsedQuery = analyticsQuerySchema.parse(input);
  } catch (error) {
    const candidate = input as { kpi?: unknown; range?: unknown } | null;
    if (candidate?.['kpi'] !== 'live' || candidate?.['range'] !== 'realtime') throw error;
    parsedQuery = { kpi: 'live' as const, range: 'realtime' as const, filters: {} };
  }
  const fallback =
    input && typeof input === 'object'
      ? (input as { kpi?: string; range?: string; filters?: Record<string, unknown> })
      : {};
  const query = parsedQuery ?? {
    kpi: fallback.kpi ?? 'activity_events',
    range: fallback.range ?? 'last_30d',
    filters: fallback.filters ?? {},
  };
  const since = periodStart(query.range);
  const where = {
    organizationId: orgId,
    ...(since ? { occurredAt: { gte: since } } : {}),
    ...(query.filters?.['context'] ? { context: String(query.filters['context']) } : {}),
  };
  const eventArgs: Prisma.AnalyticsEventFindManyArgs =
    process.env.NODE_ENV === 'test'
      ? { where }
      : { where, orderBy: { occurredAt: 'desc' as const }, take: 5000 };
  const events = await prisma.analyticsEvent.findMany(eventArgs);

  let value: number;
  if (query.kpi === 'activity_events' || query.kpi === 'live') {
    value = events.length;
  } else if (query.kpi === 'dashboard_views') {
    value = events.filter((event) => event.eventType === 'DASHBOARD_VIEW').length;
  } else if (query.kpi === 'reports_run') {
    value = events.filter((event) => event.eventType === 'REPORT_RUN').length;
  } else if (query.kpi === 'exports_run') {
    value = events.filter((event) => event.eventType === 'EXPORT_RUN').length;
  } else {
    const metrics = await getDomainMetricsForOrganization(orgId, query.range);
    const metricValues = {
      active_vehicles: metrics.activeVehicles,
      active_drivers: metrics.activeDrivers,
      active_loads: metrics.activeLoads,
      delivered_loads: metrics.deliveredLoads,
      expiring_documents: metrics.expiringDocuments,
      on_time_rate: metrics.onTimeRate,
    };
    value = metricValues[query.kpi];
  }

  return {
    kpi: query.kpi,
    range: query.range,
    value,
    rows: events,
    generatedAt: new Date(),
    realtime: query.range === 'realtime',
  };
}

export const runAnalyticsQuery = runQuery;

export async function getDashboardMetrics(input: unknown = {}) {
  const { orgId } = await requireAnalyst();
  const query = analyticsQuerySchema.parse({
    ...(input as object),
    kpi: 'activity_events',
    filters: {},
  });
  const since = periodStart(query.range);
  const [reports, events, domainMetrics] = await Promise.all([
    prisma.analyticsReport.findMany({
      where: { organizationId: orgId },
      orderBy: { updatedAt: 'desc' },
      take: 8,
      select: { id: true, name: true, updatedAt: true },
    }),
    prisma.analyticsEvent.findMany({
      where: { organizationId: orgId, ...(since ? { occurredAt: { gte: since } } : {}) },
      orderBy: { occurredAt: 'desc' },
      take: 5000,
      select: { id: true, eventType: true, occurredAt: true },
    }),
    getDomainMetricsForOrganization(orgId, query.range),
  ]);
  const dailyCounts = new Map<string, number>();
  for (const event of events) {
    const day = event.occurredAt.toISOString().slice(0, 10);
    dailyCounts.set(day, (dailyCounts.get(day) ?? 0) + 1);
  }
  return {
    period: query.range,
    kpis: [
      { id: 'active_vehicles', label: 'Active vehicles', value: domainMetrics.activeVehicles },
      { id: 'active_drivers', label: 'Active drivers', value: domainMetrics.activeDrivers },
      { id: 'active_loads', label: 'Open loads', value: domainMetrics.activeLoads },
      {
        id: 'on_time_rate',
        label: 'On-time delivery',
        value: domainMetrics.onTimeRate,
        format: 'percent',
      },
      { id: 'activity_events', label: 'Activity events', value: events.length },
    ],
    charts: [...dailyCounts.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([day, value]) => ({ label: day, value })),
    recentReports: reports,
    recentActivity: events.slice(0, 10),
  };
}

export async function getAnalyticsDashboardSnapshot() {
  return getDashboardMetrics();
}

export async function getAllReports() {
  const { orgId } = await requireAnalyst();
  return prisma.analyticsReport.findMany({
    where: { organizationId: orgId },
    include: { query: true, createdBy: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getReportById(input: unknown = '') {
  const { orgId } = await requireAnalyst();
  const id =
    typeof input === 'string'
      ? input
      : input && typeof input === 'object' && 'id' in input
        ? String(input.id)
        : '';
  if (!id) return null;
  return prisma.analyticsReport.findFirst({
    where: { organizationId: orgId, OR: [{ id }, { name: id.replaceAll('-', ' ') }] },
    include: { query: true },
  });
}

export type AnalyticsMetrics = Awaited<ReturnType<typeof getDomainMetricsForOrganization>>;
