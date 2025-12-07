import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/server/auth', () => ({ auth: { requireOrgContext: vi.fn() } }));
vi.mock('@/lib/prisma', () => {
  const complianceDocument = { findMany: vi.fn() };
  const complianceAlert = { create: vi.fn() };
  return { prisma: { complianceDocument, complianceAlert } };
});

describe('complianceExpirationAlerts (TDD)', () => {
  const orgCtx = { orgId: 'org_123' };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import('@/lib/server/auth');
    vi.mocked(auth.requireOrgContext).mockResolvedValue(orgCtx);
  });

  it('emits alert when document expiration < threshold', async () => {
    const actions = (await import('../lib/complianceActions')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.complianceDocument.findMany.mockResolvedValue([
      { id: 'doc1', organizationId: orgCtx.orgId, expiresAt: new Date(), type: 'CDL' },
    ]);

    await expect(actions.generateExpirationAlerts({ thresholdDays: 30 })).resolves.toBeDefined();
    expect(prisma.complianceAlert.create).toHaveBeenCalled();
  });

  it('suppresses alert for exempt document types', async () => {
    const actions = (await import('../lib/complianceActions')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.complianceDocument.findMany.mockResolvedValue([
      { id: 'doc1', organizationId: orgCtx.orgId, expiresAt: new Date(), type: 'INTERNAL_NOTE' },
    ]);

    await expect(actions.generateExpirationAlerts({ thresholdDays: 30 })).resolves.toBeDefined();
    expect(prisma.complianceAlert.create).not.toHaveBeenCalled();
  });

  it('handles already-alerted documents correctly', async () => {
    const actions = (await import('../lib/complianceActions')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.complianceDocument.findMany.mockResolvedValue([
      {
        id: 'doc1',
        organizationId: orgCtx.orgId,
        expiresAt: new Date(),
        lastAlertedAt: new Date(),
      },
    ]);

    await expect(actions.generateExpirationAlerts({ thresholdDays: 30 })).resolves.toBeDefined();
    expect(prisma.complianceAlert.create).not.toHaveBeenCalled();
  });

  it('escalates severity for overdue documents', async () => {
    const actions = (await import('../lib/complianceActions')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;

    prisma.complianceDocument.findMany.mockResolvedValue([
      { id: 'doc1', organizationId: orgCtx.orgId, expiresAt: new Date('2024-01-01') },
    ]);
    prisma.complianceAlert.create.mockResolvedValue({ id: 'alert1', severity: 'HIGH' });

    await expect(actions.generateExpirationAlerts({ thresholdDays: 30 })).resolves.toBeDefined();
    expect(prisma.complianceAlert.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ severity: expect.any(String), organizationId: orgCtx.orgId }),
    });
  });
});
