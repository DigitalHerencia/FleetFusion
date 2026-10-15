import { z } from 'zod';

export const driverShiftSchema = z.object({
  shiftId: z.string().optional(),
  driverId: z.string().optional(),
  startedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional(),
  summary: z.string().trim().max(2000).optional(),
});

export const driverLocationSchema = z.object({
  driverId: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  capturedAt: z.coerce.date().optional(),
  speedKph: z.number().nonnegative().max(300).optional(),
  headingDegrees: z.number().min(0).lt(360).optional(),
});

export const driverDocsUploadSchema = z.object({
  driverId: z.string().optional(),
  filename: z.string().trim().min(1).max(255),
  contentType: z
    .string()
    .trim()
    .max(150)
    .refine(
      (value) => ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(value),
      'Only PDF, JPEG, PNG, or WebP documents are supported',
    ),
  size: z
    .number()
    .int()
    .positive()
    .max(2 * 1024 * 1024),
  title: z.string().trim().max(200).optional(),
  type: z
    .enum([
      'CDL',
      'MEDICAL_CARD',
      'VEHICLE_REGISTRATION',
      'INSURANCE',
      'PERMIT',
      'IFTA_LICENCE',
      'OTHER',
    ])
    .default('OTHER'),
  file: z.unknown().optional(),
});
