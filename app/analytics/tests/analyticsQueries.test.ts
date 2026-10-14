import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../schemas/analytics.schema', () => ({ analyticsQuerySchema: { parse: vi.fn() } }));
vi.mock('@/lib/server/auth', () => ({ auth: { requireOrgContext: vi.fn() } }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    analyticsEvent: { findMany: vi.fn() },
    analyticsReport: { findMany: vi.fn() },
  },
}));

describe('analyticsQueries (TDD)', () => {
  const orgCtx = { orgId: 'org_123' };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import('@/lib/server/auth');
    vi.mocked(auth.requireOrgContext).mockResolvedValue(orgCtx);
  });

  it('runs KPI queries with org filters applied', async () => {
    const fetchers = (await import('../lib/analyticsFetchers')) as any;
    const { analyticsQuerySchema } = (await import('../schemas/analytics.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { auth } = await import('@/lib/server/auth');

    const query = { kpi: 'on_time_rate', range: 'last_30d' };
    vi.mocked(analyticsQuerySchema.parse).mockReturnValue(query);
    prisma.analyticsEvent.findMany.mockResolvedValue([]);

    await expect(fetchers.runQuery(query)).resolves.toBeDefined();

    expect(prisma.analyticsEvent.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ organizationId: orgCtx.orgId }),
    });
    expect(analyticsQuerySchema.parse).toHaveBeenCalledWith(query);
    expect(auth.requireOrgContext).toHaveBeenCalled();
    expect(auth.assertRole).toHaveBeenCalledWith('analyst');
  });

  it('merges domain metrics into dashboard snapshot', async () => {
    const fetchers = (await import('../lib/analyticsFetchers')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { auth } = await import('@/lib/server/auth');

    prisma.analyticsReport.findMany.mockResolvedValue([{ id: 'r1', organizationId: orgCtx.orgId }]);

    await expect(fetchers.getDashboardMetrics()).resolves.toMatchObject({
      charts: expect.any(Array),
    });
    expect(prisma.analyticsReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ organizationId: orgCtx.orgId }) }),
    );
    expect(auth.requireOrgContext).toHaveBeenCalled();
    expect(auth.assertRole).toHaveBeenCalledWith('analyst');
  });

  it('rejects invalid query schemas', async () => {
    const fetchers = (await import('../lib/analyticsFetchers')) as any;
    const { analyticsQuerySchema } = (await import('../schemas/analytics.schema')) as any;

    vi.mocked(analyticsQuerySchema.parse).mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(fetchers.runQuery({})).rejects.toThrow();
    expect(analyticsQuerySchema.parse).toHaveBeenCalled();
    const { auth } = await import('@/lib/server/auth');
    expect(auth.assertRole).toHaveBeenCalledWith('analyst');
  });

  it('streams realtime analytics payloads (placeholder expectation)', async () => {
    const fetchers = (await import('../lib/analyticsFetchers')) as any;
    const { auth } = await import('@/lib/server/auth');

    await expect(fetchers.runQuery({ kpi: 'live', range: 'realtime' })).resolves.toBeDefined();
    expect(auth.requireOrgContext).toHaveBeenCalled();
    expect(auth.assertRole).toHaveBeenCalledWith('analyst');
  });
});
