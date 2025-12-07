import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../schemas/drivers.schema', () => {
  const parse = vi.fn();
  const safeParse = vi.fn();
  return { driverSchema: { parse, safeParse } };
});

vi.mock('@/lib/server/auth', () => ({ auth: { requireOrgContext: vi.fn(), assertRole: vi.fn() } }));

vi.mock('@/lib/prisma', () => {
  const driver = { create: vi.fn(), update: vi.fn(), delete: vi.fn() };
  return { prisma: { driver } };
});

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

describe('driversActions (TDD)', () => {
  const orgCtx = { orgId: 'org_123', userId: 'user_456' };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import('@/lib/server/auth');
    vi.mocked(auth.requireOrgContext).mockResolvedValue(orgCtx);
  });

  it('createDriver: validates schema, scopes org, persists driver, revalidates cache', async () => {
    const actions = (await import('../lib/driversActions')) as any;
    const { driverSchema } = (await import('../schemas/drivers.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { revalidatePath } = await import('next/cache');
    const { auth } = await import('@/lib/server/auth');

    const payload = { firstName: 'A', lastName: 'B', licenseNumber: 'CDL123', licenseState: 'TX' };
    const parsed = { ...payload, organizationId: orgCtx.orgId };
    vi.mocked(driverSchema.parse).mockReturnValue(parsed);
    prisma.driver.create.mockResolvedValue({ id: 'drv_1', ...parsed });

    await expect(actions.createDriver(payload)).resolves.toMatchObject({ id: 'drv_1' });

    expect(driverSchema.parse).toHaveBeenCalledWith(payload);
    expect(prisma.driver.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ organizationId: orgCtx.orgId }),
    });
    expect(revalidatePath).toHaveBeenCalledWith('/drivers');
    expect(auth.requireOrgContext).toHaveBeenCalled();
    expect(auth.assertRole).toHaveBeenCalledWith('driver_manager');
  });

  it('updateDriver: validates input and enforces org scoping', async () => {
    const actions = (await import('../lib/driversActions')) as any;
    const { driverSchema } = (await import('../schemas/drivers.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { auth } = await import('@/lib/server/auth');

    const payload = { id: 'drv_1', firstName: 'Ada' };
    vi.mocked(driverSchema.parse).mockReturnValue(payload);
    prisma.driver.update.mockResolvedValue({ ...payload, organizationId: orgCtx.orgId });

    await expect(actions.updateDriver(payload)).resolves.toMatchObject({ id: 'drv_1' });

    expect(prisma.driver.update).toHaveBeenCalledWith({
      where: { id: 'drv_1', organizationId: orgCtx.orgId },
      data: expect.objectContaining({ firstName: 'Ada' }),
    });
    expect(auth.assertRole).toHaveBeenCalledWith('driver_manager');
  });

  it('deleteDriver: soft delete within org and revalidates tag', async () => {
    const actions = (await import('../lib/driversActions')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { revalidateTag } = await import('next/cache');
    const { auth } = await import('@/lib/server/auth');

    prisma.driver.delete.mockResolvedValue({ id: 'drv_1', organizationId: orgCtx.orgId });

    await expect(actions.deleteDriver({ id: 'drv_1' })).resolves.toMatchObject({ id: 'drv_1' });

    expect(prisma.driver.delete).toHaveBeenCalledWith({
      where: { id: 'drv_1', organizationId: orgCtx.orgId },
    });
    expect(revalidateTag).toHaveBeenCalledWith(`org:${orgCtx.orgId}:drivers`);
    expect(auth.assertRole).toHaveBeenCalledWith('driver_manager');
  });

  it('bulkImportDrivers: validates each row and batches create', async () => {
    const actions = (await import('../lib/driversActions')) as any;
    const { driverSchema } = (await import('../schemas/drivers.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { auth } = await import('@/lib/server/auth');

    const rows = [
      { firstName: 'A', lastName: 'B', licenseNumber: 'L1', licenseState: 'CA' },
      { firstName: 'C', lastName: 'D', licenseNumber: 'L2', licenseState: 'TX' },
    ];

    vi.mocked(driverSchema.safeParse)
      .mockReturnValueOnce({
        success: true,
        data: { ...rows[0], organizationId: orgCtx.orgId },
      } as any)
      .mockReturnValueOnce({
        success: true,
        data: { ...rows[1], organizationId: orgCtx.orgId },
      } as any);

    prisma.driver.create.mockResolvedValue({
      id: 'drv_2',
      ...rows[0],
      organizationId: orgCtx.orgId,
    });

    await expect(actions.bulkImportDrivers({ rows })).resolves.toBeDefined();

    expect(driverSchema.safeParse).toHaveBeenCalledTimes(rows.length);
    expect(prisma.driver.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        licenseNumber: rows[0]!.licenseNumber,
        organizationId: orgCtx.orgId,
      }),
    });
    expect(auth.assertRole).toHaveBeenCalledWith('driver_manager');
  });
});
