import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../schemas/dispatch.schema', () => {
  const parse = vi.fn();
  const safeParse = vi.fn();
  return {
    loadSchema: { parse, safeParse },
    loadStatusSchema: { parse },
    loadAssignmentSchema: { parse },
  };
});

vi.mock('@/lib/server/auth', () => ({
  auth: {
    requireOrgContext: vi.fn(),
    assertRole: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(async (cb: any) => cb({ load: prisma.load })),
    load: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    driver: {
      findFirst: vi.fn(),
    },
    loadEvent: {
      create: vi.fn(),
    },
  },
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

describe('dispatchActions (TDD)', () => {
  const orgCtx = { orgId: 'org_123', userId: 'user_456' };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import('@/lib/server/auth');
    vi.mocked(auth.requireOrgContext).mockResolvedValue(orgCtx);
  });

  it('createLoad: validates payload, scopes org, persists load, logs event, revalidates board', async () => {
    const actions = (await import('../lib/dispatchActions')) as any;
    const { loadSchema } = (await import('../schemas/dispatch.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { revalidatePath } = await import('next/cache');
    const { auth } = await import('@/lib/server/auth');

    const payload = { reference: 'LD-100', pickupAt: new Date(), dropoffAt: new Date() };
    const parsed = { ...payload, organizationId: orgCtx.orgId };
    vi.mocked(loadSchema.parse).mockReturnValue(parsed);
    prisma.load.create.mockResolvedValue({ id: 'load_1', ...parsed });

    await expect(actions.createLoad(payload)).resolves.toMatchObject({ id: 'load_1' });

    expect(loadSchema.parse).toHaveBeenCalledWith(payload);
    expect(prisma.load.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ organizationId: orgCtx.orgId }),
    });
    expect(revalidatePath).toHaveBeenCalledWith('/dispatch');
    expect(auth.requireOrgContext).toHaveBeenCalled();
    expect(auth.assertRole).toHaveBeenCalledWith('dispatcher');
  });

  it('updateLoad: enforces org scope and updates fields', async () => {
    const actions = (await import('../lib/dispatchActions')) as any;
    const { loadSchema } = (await import('../schemas/dispatch.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { auth } = await import('@/lib/server/auth');

    const payload = { id: 'load_1', reference: 'LD-101', pickupAt: new Date() };
    vi.mocked(loadSchema.parse).mockReturnValue(payload);
    prisma.load.update.mockResolvedValue({ ...payload, organizationId: orgCtx.orgId });

    await expect(actions.updateLoad(payload)).resolves.toMatchObject({ reference: 'LD-101' });

    expect(prisma.load.update).toHaveBeenCalledWith({
      where: { id: 'load_1', organizationId: orgCtx.orgId },
      data: expect.objectContaining({ reference: 'LD-101' }),
    });
    expect(auth.assertRole).toHaveBeenCalledWith('dispatcher');
  });

  it('deleteLoad: soft-deletes within org and revalidates tag', async () => {
    const actions = (await import('../lib/dispatchActions')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { revalidateTag } = await import('next/cache');
    const { auth } = await import('@/lib/server/auth');

    prisma.load.delete.mockResolvedValue({ id: 'load_1', organizationId: orgCtx.orgId });

    await expect(actions.deleteLoad({ id: 'load_1' })).resolves.toMatchObject({ id: 'load_1' });

    expect(prisma.load.delete).toHaveBeenCalledWith({
      where: { id: 'load_1', organizationId: orgCtx.orgId },
    });
    expect(revalidateTag).toHaveBeenCalledWith(`org:${orgCtx.orgId}:loads`);
    expect(auth.assertRole).toHaveBeenCalledWith('dispatcher');
  });

  it('assignDriverToLoad: validates assignment schema and driver availability before linking', async () => {
    const actions = (await import('../lib/dispatchActions')) as any;
    const { loadAssignmentSchema } = (await import('../schemas/dispatch.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { auth } = await import('@/lib/server/auth');

    const assignment = { loadId: 'load_1', driverId: 'drv_1' };
    vi.mocked(loadAssignmentSchema.parse).mockReturnValue(assignment);
    prisma.driver.findFirst.mockResolvedValue({
      id: 'drv_1',
      status: 'AVAILABLE',
      organizationId: orgCtx.orgId,
    });
    prisma.load.update.mockResolvedValue({
      id: 'load_1',
      driverId: 'drv_1',
      organizationId: orgCtx.orgId,
    });

    await expect(actions.assignDriverToLoad(assignment)).resolves.toMatchObject({
      driverId: 'drv_1',
    });

    expect(prisma.driver.findFirst).toHaveBeenCalledWith({
      where: { id: 'drv_1', organizationId: orgCtx.orgId, status: 'AVAILABLE' },
    });
    expect(prisma.load.update).toHaveBeenCalledWith({
      where: { id: 'load_1', organizationId: orgCtx.orgId },
      data: { driverId: 'drv_1' },
    });
    expect(auth.assertRole).toHaveBeenCalledWith('dispatcher');
  });

  it('updateLoadStatus: validates transitions and records event', async () => {
    const actions = (await import('../lib/dispatchActions')) as any;
    const { loadStatusSchema } = (await import('../schemas/dispatch.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { auth } = await import('@/lib/server/auth');

    const payload = { id: 'load_1', status: 'IN_TRANSIT' };
    vi.mocked(loadStatusSchema.parse).mockReturnValue(payload);
    prisma.load.update.mockResolvedValue({
      id: 'load_1',
      status: 'IN_TRANSIT',
      organizationId: orgCtx.orgId,
    });
    prisma.loadEvent.create.mockResolvedValue({ id: 'evt_1' });

    await expect(actions.updateLoadStatus(payload)).resolves.toMatchObject({
      status: 'IN_TRANSIT',
    });

    expect(prisma.load.update).toHaveBeenCalledWith({
      where: { id: 'load_1', organizationId: orgCtx.orgId },
      data: { status: 'IN_TRANSIT' },
    });
    expect(prisma.loadEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        loadId: 'load_1',
        status: 'IN_TRANSIT',
        organizationId: orgCtx.orgId,
      }),
    });
    expect(auth.assertRole).toHaveBeenCalledWith('dispatcher');
  });

  it('bulkImportLoads: validates rows, scopes org, batches creates transactionally', async () => {
    const actions = (await import('../lib/dispatchActions')) as any;
    const { loadSchema } = (await import('../schemas/dispatch.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    const rows = [
      { reference: 'LD-200', pickupAt: new Date(), dropoffAt: new Date() },
      { reference: 'LD-201', pickupAt: new Date(), dropoffAt: new Date() },
    ];

    vi.mocked(loadSchema.safeParse)
      .mockReturnValueOnce({
        success: true,
        data: { ...rows[0], organizationId: orgCtx.orgId },
      } as any)
      .mockReturnValueOnce({
        success: true,
        data: { ...rows[1], organizationId: orgCtx.orgId },
      } as any);

    prisma.load.create.mockResolvedValue({
      id: 'load_200',
      ...rows[0],
      organizationId: orgCtx.orgId,
    });
    prisma.load.create.mockResolvedValue({
      id: 'load_201',
      ...rows[1],
      organizationId: orgCtx.orgId,
    });

    await expect(actions.bulkImportLoads({ rows })).resolves.toBeDefined();

    expect(loadSchema.safeParse).toHaveBeenCalledTimes(rows.length);
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
