import { z } from 'zod';

const documentTypes = [
  'VEHICLE_REGISTRATION',
  'INSURANCE',
  'CDL',
  'MEDICAL_CARD',
  'PERMIT',
  'IFTA_LICENCE',
  'OTHER',
] as const;

const documentStatuses = ['VALID', 'EXPIRING_SOON', 'EXPIRED', 'EXEMPT'] as const;

const optionalDate = z.coerce.date().nullable().optional();

const documentInputObjectSchema = z.object({
  id: z.string().min(1).optional(),
  type: z.enum(documentTypes),
  status: z.enum(documentStatuses).optional(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(4000).nullable().optional(),
  vehicleId: z.string().min(1).nullable().optional(),
  driverId: z.string().min(1).nullable().optional(),
  issueDate: optionalDate,
  effectiveDate: optionalDate,
  expirationDate: optionalDate,
  // Accept legacy form/import columns while normalizing to the current Prisma model.
  entityType: z.enum(['vehicle', 'driver']).optional(),
  entityId: z.string().min(1).optional(),
  expiresAt: optionalDate,
  fileUploadId: z.string().min(1).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

function normalizeDocumentInput(input: z.output<typeof documentInputObjectSchema>) {
  const { entityType, entityId, expiresAt, ...document } = input;
  return {
    ...document,
    title: document.title ?? document.type.replaceAll('_', ' '),
    expirationDate: document.expirationDate ?? expiresAt,
    vehicleId: document.vehicleId ?? (entityType === 'vehicle' ? entityId : undefined),
    driverId: document.driverId ?? (entityType === 'driver' ? entityId : undefined),
  };
}

export const complianceDocumentSchema = documentInputObjectSchema
  .transform(normalizeDocumentInput)
  .refine((document) => !(document.vehicleId && document.driverId), {
    message: 'A compliance document can belong to either a vehicle or a driver, not both.',
    path: ['vehicleId'],
  });

export const complianceDocumentUpdateSchema = documentInputObjectSchema
  .partial()
  .extend({ id: z.string().min(1) })
  .transform((input) => {
    const { entityType, entityId, expiresAt, ...document } = input;
    return {
      ...document,
      ...(document.title || !document.type ? {} : { title: document.type.replaceAll('_', ' ') }),
      ...(document.expirationDate || !expiresAt ? {} : { expirationDate: expiresAt }),
      ...(document.vehicleId || entityType !== 'vehicle' || !entityId
        ? {}
        : { vehicleId: entityId }),
      ...(document.driverId || entityType !== 'driver' || !entityId ? {} : { driverId: entityId }),
    };
  })
  .refine((document) => !(document.vehicleId && document.driverId), {
    message: 'A compliance document can belong to either a vehicle or a driver, not both.',
    path: ['vehicleId'],
  });

export const complianceFiltersSchema = z.object({
  status: z.enum(documentStatuses).optional(),
  type: z.enum(documentTypes).optional(),
  vehicleId: z.string().min(1).optional(),
  driverId: z.string().min(1).optional(),
  state: z.enum(['overdue', 'upcoming', 'all']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const complianceFileUploadSchema = z.object({
  documentId: z.string().min(1),
  filename: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1).max(255),
  size: z
    .number()
    .int()
    .positive()
    .max(25 * 1024 * 1024),
  file: z.unknown().optional(),
});
