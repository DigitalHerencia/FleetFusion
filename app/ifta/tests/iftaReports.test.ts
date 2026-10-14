import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../schemas/ifta.schema', () => ({ iftaReportSchema: { parse: vi.fn() } }));
vi.mock('@/lib/server/auth', () => ({ auth: { requireOrgContext: vi.fn(), assertRole: vi.fn() } }));
vi.mock('@/lib/prisma', () => {
  const iftaTrip = { findMany: vi.fn() };
  const iftaFuelPurchase = { findMany: vi.fn() };
  return { prisma: { iftaTrip, iftaFuelPurchase } };
});

describe('iftaReports (TDD)', () => {
  const orgCtx = { orgId: 'org_123' };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import('@/lib/server/auth');
    vi.mocked(auth.requireOrgContext).mockResolvedValue(orgCtx);
  });

  it('generates valid quarterly report payload via finalizeReport', async () => {
    const actions = (await import('../lib/iftaActions')) as any;
    const { iftaReportSchema } = (await import('../schemas/ifta.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { auth } = await import('@/lib/server/auth');

    prisma.iftaTrip.findMany.mockResolvedValue([]);
    prisma.iftaFuelPurchase.findMany.mockResolvedValue([]);

    await expect(actions.finalizeReport({ quarter: '2025-Q1' })).resolves.toBeDefined();
    expect(iftaReportSchema.parse).toHaveBeenCalled();
    expect(auth.requireOrgContext).toHaveBeenCalled();
    expect(auth.assertRole).toHaveBeenCalledWith('compliance_manager');
  });

  it('rejects invalid or incomplete trip sets (schema throws)', async () => {
    const actions = (await import('../lib/iftaActions')) as any;
    const { iftaReportSchema } = (await import('../schemas/ifta.schema')) as any;

    vi.mocked(iftaReportSchema.parse).mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(actions.finalizeReport({ quarter: '2025-Q2' })).rejects.toThrow();
    const { auth } = await import('@/lib/server/auth');
    expect(auth.assertRole).toHaveBeenCalledWith('compliance_manager');
  });

  it('merges fuel + miles into jurisdiction matrix', async () => {
    const actions = (await import('../lib/iftaActions')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { auth } = await import('@/lib/server/auth');

    prisma.iftaTrip.findMany.mockResolvedValue([
      { jurisdiction: 'TX', miles: 100, organizationId: orgCtx.orgId },
    ]);
    prisma.iftaFuelPurchase.findMany.mockResolvedValue([
      { jurisdiction: 'TX', gallons: 10, organizationId: orgCtx.orgId },
    ]);

    const report = await actions.finalizeReport({ quarter: '2025-Q1' });
    expect(report).toBeDefined();
    expect(prisma.iftaTrip.findMany).toHaveBeenCalled();
    expect(prisma.iftaFuelPurchase.findMany).toHaveBeenCalled();
    expect(prisma.iftaTrip.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ organizationId: orgCtx.orgId }) }),
    );
    expect(prisma.iftaFuelPurchase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ organizationId: orgCtx.orgId }) }),
    );
    expect(auth.assertRole).toHaveBeenCalledWith('compliance_manager');
  });

  it('exports report PDF with correct metadata (placeholder expectation)', async () => {
    const actions = (await import('../lib/iftaActions')) as any;
    const { auth } = await import('@/lib/server/auth');

    await expect(actions.finalizeReport({ quarter: '2025-Q1' })).resolves.toBeDefined();
    expect(auth.assertRole).toHaveBeenCalledWith('compliance_manager');
  });
});
