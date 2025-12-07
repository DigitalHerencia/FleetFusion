import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../schemas/driversMobile.schema', () => ({
  driverShiftSchema: { parse: vi.fn() },
  driverLocationSchema: { parse: vi.fn() },
  driverDocsUploadSchema: { parse: vi.fn() },
}));

vi.mock('@/lib/server/auth', () => ({ auth: { requireOrgContext: vi.fn() } }));
vi.mock('@/lib/prisma', () => {
  const driverShift = { create: vi.fn(), update: vi.fn() };
  const driverLocation = { create: vi.fn() };
  const driverDocument = { create: vi.fn() };
  return { prisma: { driverShift, driverLocation, driverDocument } };
});
vi.mock('@/lib/files/upload', () => ({ storeFile: vi.fn() }));

describe('driversMobileFlows (TDD)', () => {
  const orgCtx = { orgId: 'org_123', userId: 'drv_1' };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import('@/lib/server/auth');
    vi.mocked(auth.requireOrgContext).mockResolvedValue(orgCtx);
  });

  it('startDriverShift: validates payload, creates active shift for driver/org', async () => {
    const flows = (await import('../lib/driversMobileFlows')) as any;
    const { driverShiftSchema } = (await import('../schemas/driversMobile.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    const payload = { startedAt: new Date() };
    vi.mocked(driverShiftSchema.parse).mockReturnValue(payload);
    prisma.driverShift.create.mockResolvedValue({
      id: 'shift_1',
      driverId: orgCtx.userId,
      organizationId: orgCtx.orgId,
    });

    await expect(flows.startDriverShift(payload)).resolves.toMatchObject({ id: 'shift_1' });

    expect(prisma.driverShift.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ driverId: orgCtx.userId, organizationId: orgCtx.orgId }),
    });
  });

  it('endDriverShift: validates payload, updates shift, and writes summary', async () => {
    const flows = (await import('../lib/driversMobileFlows')) as any;
    const { driverShiftSchema } = (await import('../schemas/driversMobile.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    const payload = { shiftId: 'shift_1', endedAt: new Date() };
    vi.mocked(driverShiftSchema.parse).mockReturnValue(payload);
    prisma.driverShift.update.mockResolvedValue({
      id: 'shift_1',
      driverId: orgCtx.userId,
      organizationId: orgCtx.orgId,
    });

    await expect(flows.endDriverShift(payload)).resolves.toMatchObject({ id: 'shift_1' });

    expect(prisma.driverShift.update).toHaveBeenCalledWith({
      where: { id: 'shift_1', driverId: orgCtx.userId, organizationId: orgCtx.orgId },
      data: expect.objectContaining({ endedAt: payload.endedAt }),
    });
  });

  it('syncDriverLocation: validates location and queues GPS event', async () => {
    const flows = (await import('../lib/driversMobileFlows')) as any;
    const { driverLocationSchema } = (await import('../schemas/driversMobile.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    const payload = { lat: 1, lng: 2, capturedAt: new Date() };
    vi.mocked(driverLocationSchema.parse).mockReturnValue(payload);
    prisma.driverLocation.create.mockResolvedValue({ id: 'loc_1', organizationId: orgCtx.orgId });

    await expect(flows.syncDriverLocation(payload)).resolves.toMatchObject({ id: 'loc_1' });

    expect(prisma.driverLocation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ organizationId: orgCtx.orgId, driverId: orgCtx.userId }),
    });
  });

  it('uploadDriverDocs: validates file payload and stores blob', async () => {
    const flows = (await import('../lib/driversMobileFlows')) as any;
    const { driverDocsUploadSchema } = (await import('../schemas/driversMobile.schema')) as any;
    const { storeFile } = await import('@/lib/files/upload');
    const { prisma } = (await import('@/lib/prisma')) as any;

    const payload = { filename: 'medical.pdf', contentType: 'application/pdf', size: 1234 };
    vi.mocked(driverDocsUploadSchema.parse).mockReturnValue(payload);
    vi.mocked(storeFile).mockResolvedValue({ url: 'https://blob/medical.pdf' });
    prisma.driverDocument.create.mockResolvedValue({ id: 'doc_1', organizationId: orgCtx.orgId });

    await expect(flows.uploadDriverDocs(payload)).resolves.toMatchObject({ id: 'doc_1' });

    expect(storeFile).toHaveBeenCalled();
    expect(prisma.driverDocument.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ organizationId: orgCtx.orgId, driverId: orgCtx.userId }),
    });
  });
});
