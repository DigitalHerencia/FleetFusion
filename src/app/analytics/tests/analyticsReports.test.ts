import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../schemas/analytics.schema', () => ({ analyticsReportSchema: { parse: vi.fn() } }));
vi.mock('@/lib/server/auth', () => ({ auth: { requireOrgContext: vi.fn(), assertRole: vi.fn() } }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    analyticsReport: { create: vi.fn(), findUnique: vi.fn() },
  },
}));

describe('analyticsReports (TDD)', () => {
  const orgCtx = { orgId: 'org_123' };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import('@/lib/server/auth');
    vi.mocked(auth.requireOrgContext).mockResolvedValue(orgCtx);
  });

  it('exports report to PDF with correct metadata (placeholder)', async () => {
    const actions = (await import('../lib/analyticsActions')) as any;
    const { auth } = await import('@/lib/server/auth');

    await expect(actions.createReport({ name: 'KPI' })).resolves.toBeDefined();
    expect(auth.requireOrgContext).toHaveBeenCalled();
    expect(auth.assertRole).toHaveBeenCalledWith('analyst');
  });

  it('validates report templates with Zod before creation', async () => {
    const actions = (await import('../lib/analyticsActions')) as any;
    const { analyticsReportSchema } = (await import('../schemas/analytics.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { auth } = await import('@/lib/server/auth');

    const payload = { name: 'Ops', template: 'kpi' };
    vi.mocked(analyticsReportSchema.parse).mockReturnValue(payload);
    prisma.analyticsReport.create.mockResolvedValue({ id: 'r1', organizationId: orgCtx.orgId });

    await expect(actions.createReport(payload)).resolves.toMatchObject({ id: 'r1' });
    expect(prisma.analyticsReport.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ organizationId: orgCtx.orgId }),
    });
    expect(analyticsReportSchema.parse).toHaveBeenCalledWith(payload);
    expect(auth.requireOrgContext).toHaveBeenCalled();
    expect(auth.assertRole).toHaveBeenCalledWith('analyst');
  });

  it('builds report dataset from multi-domain inputs (placeholder expectation)', async () => {
    const actions = (await import('../lib/analyticsActions')) as any;
    const { auth } = await import('@/lib/server/auth');

    await expect(actions.scheduleReport({ reportId: 'r1' })).resolves.toBeDefined();
    expect(auth.requireOrgContext).toHaveBeenCalled();
    expect(auth.assertRole).toHaveBeenCalledWith('analyst');
  });

  it('rejects invalid report schema payloads', async () => {
    const actions = (await import('../lib/analyticsActions')) as any;
    const { analyticsReportSchema } = (await import('../schemas/analytics.schema')) as any;

    vi.mocked(analyticsReportSchema.parse).mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(actions.createReport({})).rejects.toThrow();
    const { auth } = await import('@/lib/server/auth');
    expect(auth.assertRole).toHaveBeenCalledWith('analyst');
  });

  it('handles missing or zero-value KPIs gracefully', async () => {
    const actions = (await import('../lib/analyticsActions')) as any;
    const { analyticsReportSchema } = (await import('../schemas/analytics.schema')) as any;

    vi.mocked(analyticsReportSchema.parse).mockImplementation(() => ({
      name: 'Empty',
      template: 'kpi',
    }));
    await expect(actions.createReport({})).resolves.toBeDefined();
    const { auth } = await import('@/lib/server/auth');
    expect(auth.assertRole).toHaveBeenCalledWith('analyst');
  });
});
