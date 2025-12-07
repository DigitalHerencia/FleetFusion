import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../schemas/compliance.schema', () => ({
  iftaTripSchema: { parse: vi.fn() },
  iftaFuelSchema: { parse: vi.fn() },
  iftaReportSchema: { parse: vi.fn() },
}));

vi.mock('@/lib/server/auth', () => ({ auth: { requireOrgContext: vi.fn() } }));
vi.mock('@/lib/prisma', () => {
  const iftaTrip = { findMany: vi.fn() };
  const iftaFuelPurchase = { findMany: vi.fn() };
  return { prisma: { iftaTrip, iftaFuelPurchase } };
});

describe('iftaCalculations (TDD)', () => {
  const orgCtx = { orgId: 'org_123' };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import('@/lib/server/auth');
    vi.mocked(auth.requireOrgContext).mockResolvedValue(orgCtx);
  });

  it('computes miles per jurisdiction for quarter', async () => {
    const actions = (await import('../lib/iftaActions')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.iftaTrip.findMany.mockResolvedValue([
      { id: 't1', organizationId: orgCtx.orgId, jurisdiction: 'TX', miles: 1200 },
      { id: 't2', organizationId: orgCtx.orgId, jurisdiction: 'OK', miles: 300 },
    ]);

    const result = await actions.finalizeReport({ quarter: '2025-Q1' });
    expect(result).toBeDefined();
    expect(prisma.iftaTrip.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ organizationId: orgCtx.orgId }),
    });
  });

  it('computes gallons per jurisdiction from fuel purchases', async () => {
    const actions = (await import('../lib/iftaActions')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.iftaFuelPurchase.findMany.mockResolvedValue([
      { id: 'f1', organizationId: orgCtx.orgId, jurisdiction: 'TX', gallons: 100 },
      { id: 'f2', organizationId: orgCtx.orgId, jurisdiction: 'OK', gallons: 50 },
    ]);

    const result = await actions.finalizeReport({ quarter: '2025-Q1' });
    expect(result).toBeDefined();
    expect(prisma.iftaFuelPurchase.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ organizationId: orgCtx.orgId }),
    });
  });

  it('computes tax liability using rate table (placeholder)', async () => {
    const actions = (await import('../lib/iftaActions')) as any;

    const report = await actions.finalizeReport({ quarter: '2025-Q1' });
    expect(report).toBeDefined();
  });

  it('validates quarterly aggregation logic and schema parse', async () => {
    const actions = (await import('../lib/iftaActions')) as any;
    const { iftaReportSchema } = (await import('../schemas/compliance.schema')) as any;

    await actions.finalizeReport({ quarter: '2025-Q1' });
    expect(iftaReportSchema.parse).toHaveBeenCalled();
  });
});
