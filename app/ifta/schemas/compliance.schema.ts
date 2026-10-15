import { z } from 'zod';

const optionalString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().optional(),
);

const requiredString = (message: string) => z.string().trim().min(1, message);

const optionalDate = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.coerce.date().optional(),
);

const requiredDate = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.coerce.date({ message: 'Enter a valid date' }),
);

const optionalNonNegativeNumber = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  if (typeof value === 'string') return Number(value);
  return value;
}, z.number().finite().min(0, 'Value cannot be negative').optional());

const optionalFiniteNumber = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  if (typeof value === 'string') return Number(value);
  return value;
}, z.number().finite().optional());

const nonNegativeNumber = z.preprocess(
  (value) => (typeof value === 'string' ? Number(value) : value),
  z.number().finite().min(0, 'Value cannot be negative'),
);

const positiveNumber = z.preprocess(
  (value) =>
    value === '' || value === null ? undefined : typeof value === 'string' ? Number(value) : value,
  z.number().finite().positive('Value must be greater than zero'),
);

const jurisdictionCode = z
  .string()
  .trim()
  .min(2, 'Use a state or province code')
  .max(3, 'Use a state or province code')
  .transform((value) => value.toUpperCase());

const jurisdictionMilesSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value;
    if (!value.trim()) return undefined;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },
  z.record(jurisdictionCode, nonNegativeNumber).refine((miles) => Object.keys(miles).length > 0, {
    message: 'Enter miles for at least one jurisdiction',
  }),
);

export const iftaTripSchema = z
  .object({
    id: z.string().optional(),
    vehicleId: requiredString('Select a vehicle'),
    driverId: optionalString,
    tripNumber: requiredString('Trip number is required'),
    startedAt: requiredDate,
    endedAt: optionalDate,
    totalMiles: positiveNumber,
    jurisdictionMiles: jurisdictionMilesSchema,
  })
  .superRefine((trip, context) => {
    if (trip.endedAt && trip.endedAt < trip.startedAt) {
      context.addIssue({
        code: 'custom',
        path: ['endedAt'],
        message: 'Trip end must be on or after trip start',
      });
    }

    const allocatedMiles = Object.values(trip.jurisdictionMiles).reduce(
      (total, miles) => total + miles,
      0,
    );
    if (Math.abs(allocatedMiles - trip.totalMiles) > 0.01) {
      context.addIssue({
        code: 'custom',
        path: ['jurisdictionMiles'],
        message: 'Jurisdiction miles must add up to total trip miles',
      });
    }
  });

export const iftaFuelSchema = z.object({
  id: z.string().optional(),
  vehicleId: requiredString('Select a vehicle'),
  driverId: optionalString,
  purchaseDate: requiredDate,
  jurisdiction: jurisdictionCode,
  gallons: z.preprocess(
    (value) => (typeof value === 'string' ? Number(value) : value),
    z.number().finite().positive('Gallons must be greater than zero'),
  ),
  amountCents: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return undefined;
      if (typeof value === 'string') return Math.round(Number(value) * 100);
      return value;
    },
    z.number().int().min(0, 'Purchase amount cannot be negative'),
  ),
  currency: z
    .string()
    .trim()
    .length(3, 'Use a three-letter currency code')
    .transform((value) => value.toUpperCase())
    .default('USD'),
  vendor: optionalString,
});

export const tripSchema = iftaTripSchema;
export const fuelPurchaseSchema = iftaFuelSchema;

const jurisdictionSummarySchema = z.object({
  jurisdiction: jurisdictionCode,
  miles: nonNegativeNumber,
  gallons: nonNegativeNumber,
  taxRate: optionalNonNegativeNumber,
  taxPaid: optionalFiniteNumber,
  taxableGallons: optionalFiniteNumber,
});

export const iftaReportSchema = z
  .object({
    id: z.string().optional(),
    organizationId: z.string().optional(),
    year: z.coerce.number().int().min(2000).max(9999),
    quarter: z.coerce.number().int().min(1).max(4),
    status: z.enum(['DRAFT', 'GENERATED', 'SUBMITTED', 'ARCHIVED']).optional().default('DRAFT'),
    summary: z.record(z.string(), z.unknown()).optional(),
    rows: z.array(jurisdictionSummarySchema).optional(),
    totalMiles: optionalNonNegativeNumber,
    totalGallons: optionalNonNegativeNumber,
  })
  .refine((report) => Boolean(report.summary) || Array.isArray(report.rows), {
    path: ['summary'],
    message: 'Report must include a summary or jurisdiction rows',
  });

export type IftaTripInput = z.infer<typeof iftaTripSchema>;
export type IftaTripFormInput = z.input<typeof iftaTripSchema>;
export type IftaFuelInput = z.infer<typeof iftaFuelSchema>;
export type IftaFuelFormInput = z.input<typeof iftaFuelSchema>;
export type IftaReportInput = z.infer<typeof iftaReportSchema>;
