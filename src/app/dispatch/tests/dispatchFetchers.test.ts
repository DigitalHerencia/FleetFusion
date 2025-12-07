import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/server/auth', () => ({ auth: { requireOrgContext: vi.fn() } }));
vi.mock('@/lib/prisma', () => {
  const load = { findMany: vi.fn(), findUnique: vi.fn() };
  const driver = { findMany: vi.fn() };
  const loadEvent = { findMany: vi.fn() };
  return { prisma: { load, driver, loadEvent } };
});

describe('dispatchFetchers (TDD)', () => {
  const orgCtx = { orgId: 'org_123' };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import('@/lib/server/auth');
    vi.mocked(auth.requireOrgContext).mockResolvedValue(orgCtx);
  });

  it('getAllLoads: scopes by org, applies filters, paginates, orders newest first', async () => {
    const fetchers = (await import('../lib/dispatchFetchers')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    expect(fetchers.getAllLoads).toBeInstanceOf(Function);

    prisma.load.findMany.mockResolvedValue([
      { id: 'ld1', organizationId: orgCtx.orgId, status: 'PENDING' },
      { id: 'ld2', organizationId: orgCtx.orgId, status: 'IN_TRANSIT' },
    ]);

    await expect(
      fetchers.getAllLoads({ status: 'PENDING', page: 1, pageSize: 20 }),
    ).resolves.toHaveLength(2);

    expect(prisma.load.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ organizationId: orgCtx.orgId, status: 'PENDING' }),
      take: 20,
      skip: 0,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('getLoadById: fetches load with relations for the org', async () => {
    const fetchers = (await import('../lib/dispatchFetchers')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.load.findUnique.mockResolvedValue({
      id: 'ld1',
      organizationId: orgCtx.orgId,
      reference: 'LD-100',
    });

    await expect(fetchers.getLoadById({ id: 'ld1' })).resolves.toMatchObject({ id: 'ld1' });

    expect(prisma.load.findUnique).toHaveBeenCalledWith({
      where: { id: 'ld1', organizationId: orgCtx.orgId },
      include: expect.objectContaining({ driver: true, stops: true, events: true }),
    });
  });

  it('getDispatchBoardData: groups loads by status and attaches driver summaries', async () => {
    const fetchers = (await import('../lib/dispatchFetchers')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.load.findMany.mockResolvedValue([
      { id: 'ld1', organizationId: orgCtx.orgId, status: 'PENDING' },
      { id: 'ld2', organizationId: orgCtx.orgId, status: 'IN_TRANSIT' },
    ]);
    prisma.driver.findMany.mockResolvedValue([
      { id: 'drv1', organizationId: orgCtx.orgId, status: 'AVAILABLE' },
    ]);

    await expect(fetchers.getDispatchBoardData()).resolves.toMatchObject({
      columns: expect.any(Array),
    });

    expect(prisma.load.findMany).toHaveBeenCalledWith({ where: { organizationId: orgCtx.orgId } });
    expect(prisma.driver.findMany).toHaveBeenCalledWith({
      where: { organizationId: orgCtx.orgId },
    });
  });

  it('getDriverAssignments: aggregates loads per driver within org', async () => {
    const fetchers = (await import('../lib/dispatchFetchers')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.load.findMany.mockResolvedValue([
      { id: 'ld1', driverId: 'drv1', organizationId: orgCtx.orgId },
      { id: 'ld2', driverId: 'drv1', organizationId: orgCtx.orgId },
    ]);

    await expect(fetchers.getDriverAssignments()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ driverId: 'drv1' })]),
    );

    expect(prisma.load.findMany).toHaveBeenCalledWith({ where: { organizationId: orgCtx.orgId } });
  });

  it('getLoadHistory: merges load events ordered chronologically for org', async () => {
    const fetchers = (await import('../lib/dispatchFetchers')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.loadEvent.findMany.mockResolvedValue([
      { id: 'evt1', loadId: 'ld1', occurredAt: new Date('2024-01-01') },
      { id: 'evt2', loadId: 'ld1', occurredAt: new Date('2024-01-02') },
    ]);

    await expect(fetchers.getLoadHistory({ id: 'ld1' })).resolves.toHaveLength(2);

    expect(prisma.loadEvent.findMany).toHaveBeenCalledWith({
      where: { loadId: 'ld1', organizationId: orgCtx.orgId },
      orderBy: { occurredAt: 'asc' },
    });
  });
});
