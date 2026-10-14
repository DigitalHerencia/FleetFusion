import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/server/auth', () => ({ auth: { requireOrgContext: vi.fn() } }));
vi.mock('@/lib/prisma', () => {
  const complianceDocument = { findMany: vi.fn(), findUnique: vi.fn() };
  const vehicle = { findMany: vi.fn() };
  const driver = { findMany: vi.fn() };
  return { prisma: { complianceDocument, vehicle, driver } };
});

describe('complianceFetchers (TDD)', () => {
  const orgCtx = { orgId: 'org_123' };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import('@/lib/server/auth');
    vi.mocked(auth.requireOrgContext).mockResolvedValue(orgCtx);
  });

  it('getAllComplianceDocuments: scopes org, filters, paginates, sorts by expiration', async () => {
    const fetchers = (await import('../lib/complianceFetchers')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.complianceDocument.findMany.mockResolvedValue([
      { id: 'doc1', organizationId: orgCtx.orgId },
    ]);

    await expect(
      fetchers.getAllComplianceDocuments({ status: 'ACTIVE', page: 1, pageSize: 25 }),
    ).resolves.toHaveLength(1);

    expect(prisma.complianceDocument.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ organizationId: orgCtx.orgId, status: 'ACTIVE' }),
      take: 25,
      skip: 0,
      orderBy: { expiresAt: 'asc' },
    });
  });

  it('getComplianceDocumentById: includes linked vehicle/driver/doc metadata', async () => {
    const fetchers = (await import('../lib/complianceFetchers')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.complianceDocument.findUnique.mockResolvedValue({
      id: 'doc1',
      organizationId: orgCtx.orgId,
    });

    await expect(fetchers.getComplianceDocumentById({ id: 'doc1' })).resolves.toMatchObject({
      id: 'doc1',
    });

    expect(prisma.complianceDocument.findUnique).toHaveBeenCalledWith({
      where: { id: 'doc1', organizationId: orgCtx.orgId },
      include: expect.objectContaining({ vehicle: true, driver: true, auditLogs: true }),
    });
  });

  it('getComplianceSummary: aggregates counts per entity', async () => {
    const fetchers = (await import('../lib/complianceFetchers')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.complianceDocument.findMany.mockResolvedValue([
      { id: 'doc1', organizationId: orgCtx.orgId, entityType: 'vehicle', entityId: 'veh1' },
      { id: 'doc2', organizationId: orgCtx.orgId, entityType: 'driver', entityId: 'drv1' },
    ]);

    await expect(fetchers.getComplianceSummary()).resolves.toMatchObject({
      vehicles: expect.any(Number),
    });

    expect(prisma.complianceDocument.findMany).toHaveBeenCalledWith({
      where: { organizationId: orgCtx.orgId },
    });
  });

  it('getExpirationAlerts: filters documents by due/overdue window', async () => {
    const fetchers = (await import('../lib/complianceFetchers')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.complianceDocument.findMany.mockResolvedValue([
      { id: 'doc1', organizationId: orgCtx.orgId, expiresAt: new Date() },
    ]);

    await expect(fetchers.getExpirationAlerts({ state: 'overdue' })).resolves.toHaveLength(1);

    expect(prisma.complianceDocument.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ organizationId: orgCtx.orgId }),
      orderBy: { expiresAt: 'asc' },
    });
  });

  it('getRelatedVehicleAndDriverData: fetches linked entities for the org', async () => {
    const fetchers = (await import('../lib/complianceFetchers')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.vehicle.findMany.mockResolvedValue([{ id: 'veh1', organizationId: orgCtx.orgId }]);
    prisma.driver.findMany.mockResolvedValue([{ id: 'drv1', organizationId: orgCtx.orgId }]);

    await expect(
      fetchers.getRelatedVehicleAndDriverData({ vehicleIds: ['veh1'], driverIds: ['drv1'] }),
    ).resolves.toMatchObject({
      vehicles: expect.any(Array),
      drivers: expect.any(Array),
    });

    expect(prisma.vehicle.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['veh1'] }, organizationId: orgCtx.orgId },
    });
    expect(prisma.driver.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['drv1'] }, organizationId: orgCtx.orgId },
    });
  });
});
