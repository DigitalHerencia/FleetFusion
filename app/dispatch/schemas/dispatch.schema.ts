import { z } from 'zod';

const optionalDate = z.coerce.date().nullable().optional();
const optionalText = z.string().trim().max(500).nullable().optional();

export const loadSchema = z
  .object({
    id: z.string().optional(),
    reference: z.string().trim().min(1).max(80),
    status: z
      .enum([
        'DRAFT',
        'PLANNED',
        'ASSIGNED',
        'AT_PICKUP',
        'IN_TRANSIT',
        'AT_DROPOFF',
        'DELIVERED',
        'CANCELED',
      ])
      .optional(),
    pickupAddress: optionalText,
    pickupCity: optionalText,
    pickupState: z.string().trim().length(2).toUpperCase().nullable().optional(),
    pickupScheduledAt: optionalDate,
    pickupAt: optionalDate,
    dropoffAddress: optionalText,
    dropoffCity: optionalText,
    dropoffState: z.string().trim().length(2).toUpperCase().nullable().optional(),
    dropoffScheduledAt: optionalDate,
    dropoffAt: optionalDate,
    rateCents: z.number().int().nonnegative().nullable().optional(),
    currency: z.string().trim().length(3).toUpperCase().nullable().optional(),
    driverId: z.string().nullable().optional(),
    vehicleId: z.string().nullable().optional(),
    organizationId: z.string().optional(),
  })
  .refine(
    (load) => {
      const pickup = load.pickupScheduledAt ?? load.pickupAt;
      const dropoff = load.dropoffScheduledAt ?? load.dropoffAt;
      return !pickup || !dropoff || dropoff >= pickup;
    },
    { message: 'Drop-off must be scheduled after pickup', path: ['dropoffScheduledAt'] },
  );

export const loadStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum([
    'DRAFT',
    'PLANNED',
    'ASSIGNED',
    'AT_PICKUP',
    'IN_TRANSIT',
    'AT_DROPOFF',
    'DELIVERED',
    'CANCELED',
  ]),
  notes: z.string().trim().max(2000).optional(),
});

export const loadAssignmentSchema = z.object({
  loadId: z.string().min(1),
  driverId: z.string().min(1),
  vehicleId: z.string().min(1).optional(),
});

export const loadFiltersSchema = z.object({
  status: z
    .enum([
      'DRAFT',
      'PLANNED',
      'ASSIGNED',
      'AT_PICKUP',
      'IN_TRANSIT',
      'AT_DROPOFF',
      'DELIVERED',
      'CANCELED',
    ])
    .optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(25),
});

export const bulkLoadImportSchema = z.object({
  rows: z.array(z.unknown()).min(1).max(500),
});
