import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../schemas/compliance.schema', () => {
  const parse = vi.fn();
  const safeParse = vi.fn();
  return {
    complianceDocumentSchema: { parse, safeParse },
    complianceFileUploadSchema: { parse },
  };
});

vi.mock('@/lib/server/auth', () => ({ auth: { requireOrgContext: vi.fn(), assertRole: vi.fn() } }));
vi.mock('@/lib/prisma', () => {
  const complianceDocument = {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
  };
  const complianceAlert = { create: vi.fn() };
  return { prisma: { complianceDocument, complianceAlert } };
});
vi.mock('@/lib/files/upload', () => ({ storeFile: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

describe('complianceActions (TDD)', () => {
  const orgCtx = { orgId: 'org_123', userId: 'user_456' };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { auth } = await import('@/lib/server/auth');
    vi.mocked(auth.requireOrgContext).mockResolvedValue(orgCtx);
  });

  it('createDocument: validates schema, scopes org, persists document, revalidates cache', async () => {
    const actions = (await import('../lib/complianceActions')) as any;
    const { complianceDocumentSchema } = (await import('../schemas/compliance.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { revalidatePath } = await import('next/cache');
    const { auth } = await import('@/lib/server/auth');

    const payload = { type: 'CDL', entityType: 'driver', entityId: 'drv1', expiresAt: new Date() };
    const parsed = { ...payload, organizationId: orgCtx.orgId };
    vi.mocked(complianceDocumentSchema.parse).mockReturnValue(parsed);
    prisma.complianceDocument.create.mockResolvedValue({ id: 'doc1', ...parsed });

    await expect(actions.createDocument(payload)).resolves.toMatchObject({ id: 'doc1' });

    expect(prisma.complianceDocument.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ organizationId: orgCtx.orgId }),
    });
    expect(revalidatePath).toHaveBeenCalledWith('/compliance');
    expect(auth.requireOrgContext).toHaveBeenCalled();
    expect(auth.assertRole).toHaveBeenCalledWith('compliance_manager');
  });

  it('updateDocument: validates payload and updates by org-scoped where', async () => {
    const actions = (await import('../lib/complianceActions')) as any;
    const { complianceDocumentSchema } = (await import('../schemas/compliance.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { auth } = await import('@/lib/server/auth');

    const payload = { id: 'doc1', status: 'APPROVED' };
    vi.mocked(complianceDocumentSchema.parse).mockReturnValue(payload);
    prisma.complianceDocument.update.mockResolvedValue({
      ...payload,
      organizationId: orgCtx.orgId,
    });

    await expect(actions.updateDocument(payload)).resolves.toMatchObject({ status: 'APPROVED' });

    expect(prisma.complianceDocument.update).toHaveBeenCalledWith({
      where: { id: 'doc1', organizationId: orgCtx.orgId },
      data: expect.objectContaining({ status: 'APPROVED' }),
    });
    expect(auth.assertRole).toHaveBeenCalledWith('compliance_manager');
  });

  it('deleteDocument: soft-deletes within org and revalidates tag', async () => {
    const actions = (await import('../lib/complianceActions')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { revalidateTag } = await import('next/cache');
    const { auth } = await import('@/lib/server/auth');

    prisma.complianceDocument.delete.mockResolvedValue({
      id: 'doc1',
      organizationId: orgCtx.orgId,
    });

    await expect(actions.deleteDocument({ id: 'doc1' })).resolves.toMatchObject({ id: 'doc1' });

    expect(prisma.complianceDocument.delete).toHaveBeenCalledWith({
      where: { id: 'doc1', organizationId: orgCtx.orgId },
    });
    expect(revalidateTag).toHaveBeenCalledWith(`org:${orgCtx.orgId}:compliance`);
    expect(auth.assertRole).toHaveBeenCalledWith('compliance_manager');
  });

  it('uploadComplianceFile: validates upload payload, stores blob, links document record', async () => {
    const actions = (await import('../lib/complianceActions')) as any;
    const { complianceFileUploadSchema } = (await import('../schemas/compliance.schema')) as any;
    const { storeFile } = await import('@/lib/files/upload');
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { auth } = await import('@/lib/server/auth');

    const payload = {
      filename: 'cdl.pdf',
      contentType: 'application/pdf',
      size: 1024,
      documentId: 'doc1',
    };
    vi.mocked(complianceFileUploadSchema.parse).mockReturnValue(payload);
    vi.mocked(storeFile).mockResolvedValue({ url: 'https://blob/cdl.pdf' });
    prisma.complianceDocument.update.mockResolvedValue({
      id: 'doc1',
      fileUrl: 'https://blob/cdl.pdf',
    });

    await expect(actions.uploadComplianceFile(payload)).resolves.toMatchObject({
      fileUrl: 'https://blob/cdl.pdf',
    });

    expect(storeFile).toHaveBeenCalled();
    expect(prisma.complianceDocument.update).toHaveBeenCalledWith({
      where: { id: 'doc1', organizationId: orgCtx.orgId },
      data: expect.objectContaining({ fileUrl: 'https://blob/cdl.pdf' }),
    });
    expect(auth.assertRole).toHaveBeenCalledWith('compliance_manager');
  });

  it('generateExpirationAlerts: finds due documents and emits alerts', async () => {
    const actions = (await import('../lib/complianceActions')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { auth } = await import('@/lib/server/auth');

    const soon = new Date();
    prisma.complianceDocument.findMany.mockResolvedValue([
      { id: 'doc1', organizationId: orgCtx.orgId, expiresAt: soon, entityId: 'veh1' },
    ]);
    prisma.complianceAlert.create.mockResolvedValue({ id: 'alert1' });

    await expect(actions.generateExpirationAlerts({ thresholdDays: 30 })).resolves.toBeDefined();

    expect(prisma.complianceDocument.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ organizationId: orgCtx.orgId }),
    });
    expect(prisma.complianceAlert.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ documentId: 'doc1', organizationId: orgCtx.orgId }),
    });
    expect(auth.assertRole).toHaveBeenCalledWith('compliance_manager');
  });

  it('bulkImportComplianceRecords: validates rows and creates documents transactionally', async () => {
    const actions = (await import('../lib/complianceActions')) as any;
    const { complianceDocumentSchema } = (await import('../schemas/compliance.schema')) as any;
    const { prisma } = (await import('@/lib/prisma')) as any;
    const { auth } = await import('@/lib/server/auth');

    const rows = [{ type: 'INSURANCE', entityId: 'veh1' }];
    vi.mocked(complianceDocumentSchema.safeParse).mockReturnValue({
      success: true,
      data: { ...rows[0], organizationId: orgCtx.orgId },
    } as any);
    prisma.complianceDocument.create.mockResolvedValue({
      id: 'docX',
      ...rows[0],
      organizationId: orgCtx.orgId,
    });

    await expect(actions.bulkImportComplianceRecords({ rows })).resolves.toBeDefined();

    expect(complianceDocumentSchema.safeParse).toHaveBeenCalled();
    expect(prisma.complianceDocument.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ organizationId: orgCtx.orgId, type: 'INSURANCE' }),
    });
    expect(auth.assertRole).toHaveBeenCalledWith('compliance_manager');
  });
});
