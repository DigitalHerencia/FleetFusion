import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/server/auth', () => ({ auth: { requireOrgContext: vi.fn() } }));
vi.mock('@/lib/prisma', () => {
  const driver = { findMany: vi.fn(), findUnique: vi.fn() };
  const load = { findMany: vi.fn() };
  return { prisma: { driver, load } };
});

describe('driversFetchers (TDD)', () => {
  const orgCtx = { orgId: 'org_123' };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import('@/lib/server/auth');
    vi.mocked(auth.requireOrgContext).mockResolvedValue(orgCtx);
  });

  it('getAllDrivers: scopes to org, applies filters, paginates', async () => {
    const fetchers = (await import('../lib/driversFetchers')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.driver.findMany.mockResolvedValue([
      { id: 'drv_1', organizationId: orgCtx.orgId },
      { id: 'drv_2', organizationId: orgCtx.orgId },
    ]);

    await expect(
      fetchers.getAllDrivers({ status: 'ACTIVE', page: 2, pageSize: 10 }),
    ).resolves.toHaveLength(2);

    expect(prisma.driver.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ organizationId: orgCtx.orgId, status: 'ACTIVE' }),
      take: 10,
      skip: 10,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('getDriverById: returns normalized payload with compliance and assignments', async () => {
    const fetchers = (await import('../lib/driversFetchers')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.driver.findUnique.mockResolvedValue({ id: 'drv_1', organizationId: orgCtx.orgId });
    prisma.load.findMany.mockResolvedValue([]);

    await expect(fetchers.getDriverById({ id: 'drv_1' })).resolves.toMatchObject({ id: 'drv_1' });

    expect(prisma.driver.findUnique).toHaveBeenCalledWith({
      where: { id: 'drv_1', organizationId: orgCtx.orgId },
      include: expect.objectContaining({ documents: true, medicalCards: true }),
    });
  });

  it('getDriversForDashboard: aggregates active/expired compliance counts', async () => {
    const fetchers = (await import('../lib/driversFetchers')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.driver.findMany.mockResolvedValue([
      { id: 'drv_1', organizationId: orgCtx.orgId, status: 'ACTIVE' },
      { id: 'drv_2', organizationId: orgCtx.orgId, status: 'INACTIVE' },
    ]);

    await expect(fetchers.getDriversForDashboard()).resolves.toMatchObject({ total: 2 });

    expect(prisma.driver.findMany).toHaveBeenCalledWith({
      where: { organizationId: orgCtx.orgId },
    });
  });

  it('getDriverHistory: merges loads and events ordered chronologically', async () => {
    const fetchers = (await import('../lib/driversFetchers')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.load.findMany.mockResolvedValue([
      { id: 'ld1', driverId: 'drv_1', pickupScheduledAt: new Date('2024-02-01') },
    ]);

    await expect(fetchers.getDriverHistory({ id: 'drv_1' })).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'load' })]),
    );

    expect(prisma.load.findMany).toHaveBeenCalledWith({
      where: { driverId: 'drv_1', organizationId: orgCtx.orgId },
      orderBy: { pickupScheduledAt: 'desc' },
    });
  });
});
