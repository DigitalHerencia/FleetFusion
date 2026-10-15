'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import type { Prisma } from '@prisma/client';
import type { z } from 'zod';

import { storeFile } from '@/lib/files/upload';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { complianceDocumentSchema, complianceFileUploadSchema } from '../schemas/compliance.schema';

type ComplianceData = z.output<typeof complianceDocumentSchema>;
type OrgContext = Awaited<ReturnType<typeof auth.requireOrgContext>>;
type OptionalEntityDelegate = {
  findFirst?: (args: {
    where: { id: string; organizationId: string; deletedAt: null };
    select: { id: true };
  }) => Promise<{ id: string } | null>;
};
type AuditLogDelegate = {
  create?: (args: {
    data: {
      organizationId: string;
      action: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT';
      entityType: string;
      entityId: string | null;
      metadata: Record<string, unknown>;
    };
  }) => Promise<unknown>;
};
type ComplianceTransaction = Prisma.TransactionClient;
type ComplianceClient = ComplianceTransaction & {
  $transaction?: <T>(
    callback: (transaction: ComplianceTransaction) => Promise<T>,
  ) => Promise<T>;
};
type AlertDelegate = {
  findMany?: (args: {
    where: { organizationId: string; documentId: { in: string[] }; resolvedAt: null };
    select: { documentId: true };
  }) => Promise<Array<{ documentId: string }>>;
  create: (args: {
    data: Prisma.ComplianceExpirationAlertUncheckedCreateInput;
  }) => Promise<{ id: string }>;
};

async function requireComplianceManager(): Promise<OrgContext> {
  const context = await auth.requireOrgContext();
  await auth.assertRole('compliance_manager');
  return context;
}

async function assertEntityBelongsToOrganization(
  entity: 'vehicle' | 'driver' | 'fileUpload',
  id: unknown,
  organizationId: string,
) {
  if (typeof id !== 'string' || !id) return;
  const model = (prisma as unknown as Record<string, unknown>)[entity] as
    | OptionalEntityDelegate
    | undefined;
  if (typeof model?.findFirst !== 'function') return;

  const record = await model.findFirst({
    where: { id, organizationId, deletedAt: null },
    select: { id: true },
  });
  if (!record) throw new Error(`${entity} was not found in this organization.`);
}

function invalidateCompliance(organizationId: string) {
  revalidatePath('/compliance');
  const revalidateOrganizationTag = revalidateTag as unknown as (tag: string) => void;
  revalidateOrganizationTag(`org:${organizationId}:compliance`);
}

async function writeComplianceAudit(
  context: OrgContext,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT',
  entityId: string | null,
  metadata?: Record<string, unknown>,
) {
  const auditLog = (prisma as unknown as Record<string, unknown>)['auditLog'] as
    | AuditLogDelegate
    | undefined;
  if (typeof auditLog?.create !== 'function') return;
  await auditLog.create({
    data: {
      organizationId: context.orgId,
      action,
      entityType: 'ComplianceDocument',
      entityId,
      metadata: { actorUserId: context.userId, ...metadata },
    },
  });
}

export async function createDocument(input: unknown) {
  const context = await requireComplianceManager();
  const parsed = complianceDocumentSchema.parse(input) as ComplianceData;
  await assertEntityBelongsToOrganization('vehicle', parsed['vehicleId'], context.orgId);
  await assertEntityBelongsToOrganization('driver', parsed['driverId'], context.orgId);
  await assertEntityBelongsToOrganization('fileUpload', parsed['fileUploadId'], context.orgId);

  const data = { ...parsed };
  delete data.id;
  const document = await prisma.complianceDocument.create({
    data: { ...data, organizationId: context.orgId } as Prisma.ComplianceDocumentUncheckedCreateInput,
  });
  await writeComplianceAudit(context, 'CREATE', document.id);
  invalidateCompliance(context.orgId);
  return document;
}

export async function updateDocument(input: unknown) {
  const context = await requireComplianceManager();
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new Error('A compliance document payload is required.');
  }
  const values = input as Record<string, unknown>;
  const hasType = Object.prototype.hasOwnProperty.call(values, 'type');
  const hasTitle = Object.prototype.hasOwnProperty.call(values, 'title');
  const parsed = complianceDocumentSchema.parse({
    ...values,
    ...(hasType ? {} : { type: 'OTHER' }),
  }) as ComplianceData;
  if (!hasType) delete parsed['type'];
  if (!hasTitle && !hasType) delete parsed['title'];
  const id = parsed['id'];
  if (typeof id !== 'string' || !id) throw new Error('A document id is required.');
  await assertEntityBelongsToOrganization('vehicle', parsed['vehicleId'], context.orgId);
  await assertEntityBelongsToOrganization('driver', parsed['driverId'], context.orgId);
  await assertEntityBelongsToOrganization('fileUpload', parsed['fileUploadId'], context.orgId);

  const data = { ...parsed };
  delete data.id;
  delete (data as Record<string, unknown>)['organizationId'];
  const document = await prisma.complianceDocument.update({
    where: { id, organizationId: context.orgId },
    data: data as Prisma.ComplianceDocumentUncheckedUpdateInput,
  });
  await writeComplianceAudit(context, 'UPDATE', id);
  invalidateCompliance(context.orgId);
  return document;
}

export async function deleteDocument(input: { id: string }) {
  const context = await requireComplianceManager();
  if (!input?.id) throw new Error('A document id is required.');
  const document = await prisma.complianceDocument.delete({
    where: { id: input.id, organizationId: context.orgId },
  });
  await writeComplianceAudit(context, 'DELETE', input.id);
  invalidateCompliance(context.orgId);
  return document;
}

export async function uploadComplianceFile(input: unknown) {
  const context = await requireComplianceManager();
  const parsed = complianceFileUploadSchema.parse(input);
  const stored = await storeFile(parsed.file ?? parsed);
  const fileUrl =
    typeof stored === 'object' && stored !== null && 'url' in stored
      ? String((stored as { url: unknown }).url)
      : '';
  if (!fileUrl) throw new Error('The compliance file could not be stored.');

  const persistUpload = async (client: ComplianceTransaction) => {
    const fileModel = client.fileUpload;
    const fileRecord =
      typeof fileModel?.create === 'function'
        ? await fileModel.create({
            data: {
              organizationId: context.orgId,
              storageKey: fileUrl,
              url: fileUrl,
              fileName: parsed.filename,
              mimeType: parsed.contentType,
              sizeBytes: parsed.size,
              relatedEntity: 'ComplianceDocument',
              relatedEntityId: parsed.documentId,
              uploadedById: context.userId,
            },
          })
        : null;
    const data = fileRecord
      ? {
          fileUploadId: fileRecord.id,
          metadata: {
            filename: parsed.filename,
            contentType: parsed.contentType,
            size: parsed.size,
            fileUrl,
          },
        }
      : {
          fileUrl,
          metadata: {
            filename: parsed.filename,
            contentType: parsed.contentType,
            size: parsed.size,
            fileUrl,
          },
        };
    return client.complianceDocument.update({
      where: { id: parsed.documentId, organizationId: context.orgId },
      data: data as Prisma.ComplianceDocumentUncheckedUpdateInput,
    });
  };
  const client = prisma as unknown as ComplianceClient;
  const document =
    typeof client.$transaction === 'function'
      ? await client.$transaction((transaction) => persistUpload(transaction))
      : await persistUpload(client);
  await writeComplianceAudit(context, 'UPDATE', parsed.documentId, {
    operation: 'file_upload',
    filename: parsed.filename,
  });
  invalidateCompliance(context.orgId);
  return { ...document, fileUrl };
}

export async function generateExpirationAlerts(input: { thresholdDays?: number } = {}) {
  const context = await requireComplianceManager();
  const thresholdDays = Math.max(0, Math.min(365, Math.floor(input.thresholdDays ?? 30)));
  const now = new Date();
  const threshold = new Date(now.getTime() + thresholdDays * 24 * 60 * 60 * 1000);
  const documents = await prisma.complianceDocument.findMany({
    where: { organizationId: context.orgId },
  });

  const alertModel = (
    (prisma as unknown as Record<string, unknown>)['complianceExpirationAlert'] ??
    (prisma as unknown as Record<string, unknown>)['complianceAlert']
  ) as AlertDelegate;
  const dueDocuments = (
    documents as Array<
      ComplianceData & {
        deletedAt?: Date | null;
        expiresAt?: Date | null;
        lastAlertedAt?: Date | null;
      }
    >
  ).filter(
    (document) => {
    const expiresAt = document.expirationDate ?? document.expiresAt;
    return (
      expiresAt &&
      new Date(expiresAt).getTime() <= threshold.getTime() &&
      document.status !== 'EXEMPT' &&
      document.deletedAt == null
    );
    },
  );
  const existingAlerts =
    typeof alertModel?.findMany === 'function'
      ? await alertModel.findMany({
          where: {
            organizationId: context.orgId,
            documentId: { in: dueDocuments.map((document) => document.id) },
            resolvedAt: null,
          },
          select: { documentId: true },
        })
      : [];
  const alertedIds = new Set(
    existingAlerts.map((alert) => alert.documentId),
  );
  const alerts = [];
  for (const document of dueDocuments) {
    const expirationDate = document.expirationDate ?? document.expiresAt;
    if (!expirationDate || document.type === 'INTERNAL_NOTE') continue;
    if (document.lastAlertedAt || alertedIds.has(document.id)) continue;
    const isOverdue = new Date(expirationDate).getTime() < now.getTime();
    const alert = await alertModel.create({
      data: {
        organizationId: context.orgId,
        documentId: document.id,
        severity: isOverdue ? 'CRITICAL' : 'WARNING',
        state: isOverdue ? 'OVERDUE' : 'OPEN',
        metadata: { expirationDate: new Date(expirationDate).toISOString() },
      },
    });
    alerts.push(alert);
  }

  if (alerts.length) invalidateCompliance(context.orgId);
  return alerts;
}

export async function loadExpirationAlerts(input: { thresholdDays?: number } = {}) {
  const context = await auth.requireOrgContext();
  const thresholdDays = Math.max(0, Math.min(365, Math.floor(input.thresholdDays ?? 30)));
  const now = new Date();
  const threshold = new Date(now.getTime() + thresholdDays * 24 * 60 * 60 * 1000);
  return prisma.complianceDocument.findMany({
    where: {
      organizationId: context.orgId,
      expirationDate: { lte: threshold },
      status: { not: 'EXEMPT' },
      deletedAt: null,
    },
    orderBy: { expirationDate: 'asc' },
    include: { alerts: { where: { resolvedAt: null }, take: 1 }, vehicle: true, driver: true },
  });
}

export async function bulkImportComplianceRecords(input: { rows: unknown[]; source?: string }) {
  const context = await requireComplianceManager();
  if (!Array.isArray(input?.rows)) throw new Error('Import rows must be an array.');

  const validRows: ComplianceData[] = [];
  const errors: Array<{ index: number; message: string }> = [];
  input.rows.forEach((row, index) => {
    const result = complianceDocumentSchema.safeParse(row);
    if (result.success) validRows.push(result.data as ComplianceData);
    else
      errors.push({ index, message: result.error.issues.map((issue) => issue.message).join('; ') });
  });

  const createRows = async (client: ComplianceTransaction) =>
    Promise.all(
      validRows.map(async (row) => {
        await assertEntityBelongsToOrganization('vehicle', row['vehicleId'], context.orgId);
        await assertEntityBelongsToOrganization('driver', row['driverId'], context.orgId);
        await assertEntityBelongsToOrganization('fileUpload', row['fileUploadId'], context.orgId);
        const data = { ...row };
        delete data.id;
        return client.complianceDocument.create({
          data: {
            ...data,
            organizationId: context.orgId,
          } as Prisma.ComplianceDocumentUncheckedCreateInput,
        });
      }),
    );

  const client = prisma as unknown as ComplianceClient;
  const created =
    typeof client.$transaction === 'function'
      ? await client.$transaction((transaction) => createRows(transaction))
      : await createRows(client);
  if (typeof client.complianceRecordImport?.create === 'function') {
    const imported = await client.complianceRecordImport.create({
      data: {
        organizationId: context.orgId,
        source: input.source ?? null,
        rowCount: input.rows.length,
        processedCount: created.length,
        errorCount: errors.length,
        metadata: { errors },
      } as Prisma.ComplianceRecordImportUncheckedCreateInput,
    });
    await writeComplianceAudit(context, 'IMPORT', imported.id, {
      importId: imported.id,
      importedCount: created.length,
      errorCount: errors.length,
    });
  }
  invalidateCompliance(context.orgId);
  return { created, importedCount: created.length, errors };
}
