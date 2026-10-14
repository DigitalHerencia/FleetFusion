import { z } from 'zod';

const requiredTrimmedString = (message: string) => z.string().trim().min(1, message);
const vinString = () =>
  requiredTrimmedString('VIN is required').transform((value) => value.toUpperCase());
const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}, z.string().optional());

const optionalPositiveInt = (message: string) =>
  z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    if (typeof value === 'string') return Number(value);
    return value;
  }, z.number().int().min(0, message).optional());

// Enumerations for vehicle status and type (must match Prisma enums)
const VehicleStatusValues = ['ACTIVE', 'IN_SHOP', 'OUT_OF_SERVICE', 'SOLD', 'ARCHIVED'] as const;
const VehicleTypeValues = [
  'TRACTOR',
  'TRAILER',
  'STRAIGHT_TRUCK',
  'SERVICE_VEHICLE',
  'OTHER',
] as const;

/**
 * Schema for vehicle creation/update. All fields are validated.
 * - `organizationId`: required string (injected from context).
 * - `name`: required nonempty string (unit number or asset name).
 * - `vin`: required nonempty string (vehicle VIN).
 * - `plateNumber` and `plateState`: optional, but if plateNumber is provided then plateState must be provided.
 * - `type`: optional vehicle type (defaults to "TRACTOR").
 * - `status`: optional status (defaults to "ACTIVE").
 * - `year`: optional integer (must be reasonable year if present).
 * - `make`, `model`: optional strings.
 * - Other numeric attributes (odometer, axleCount): optional and must be non-negative if present.
 */
export const vehicleSchema = z
  .object({
    id: z.string().cuid().optional(), // id is optional (not provided on create; may be included on update)
    organizationId: z.string().min(1, 'Organization is required'), // allow custom org ids set by auth context
    name: requiredTrimmedString('Unit number or name is required'),
    vin: vinString(),
    plateNumber: optionalTrimmedString,
    plateState: optionalTrimmedString,
    type: z.enum(VehicleTypeValues).optional().default('TRACTOR'),
    status: z.enum(VehicleStatusValues).optional().default('ACTIVE'),
    year: z.preprocess(
      (value) => {
        if (value === '' || value === null || value === undefined) return undefined;
        if (typeof value === 'string') return Number(value);
        return value;
      },
      z
        .number()
        .int('Year must be an integer')
        .min(1886, 'Year must be >= 1886') // first automobile year
        .max(new Date().getFullYear() + 5, 'Year is too far in the future')
        .optional(),
    ),
    make: optionalTrimmedString,
    model: optionalTrimmedString,
    odometer: optionalPositiveInt('Odometer cannot be negative'),
    fuelType: optionalTrimmedString,
    axleCount: optionalPositiveInt('Axle count cannot be negative'),
    // `deletedAt` field is set by system on deletion; do not allow from input
    deletedAt: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    // If plateNumber is provided, plateState must also be provided (and vice versa)
    if (data.plateNumber && !data.plateState) {
      ctx.addIssue({
        path: ['plateState'],
        code: 'custom',
        message: 'State is required when plate number is provided',
      });
    }
    if (data.plateState && !data.plateNumber) {
      ctx.addIssue({
        path: ['plateNumber'],
        code: 'custom',
        message: 'Plate number is required when state is provided',
      });
    }
  });

/**
 * Schema for listing and filtering vehicles.
 * - `status`: optional filter by status (must be valid enum if present).
 * - `type`: optional filter by type.
 * - `search`: optional search term for VIN, name, make, or model.
 * - `page`: optional page number (defaults to 1, minimum 1).
 * - `pageSize`: optional page size (defaults to 50, minimum 1, max 100).
 */
export const vehicleFiltersSchema = z.object({
  status: z.enum(VehicleStatusValues).optional(),
  type: z.enum(VehicleTypeValues).optional(),
  search: optionalTrimmedString,
  page: z
    .preprocess(
      (value) => (typeof value === 'string' ? Number(value) : value),
      z.number().int().min(1).optional(),
    )
    .default(1),
  pageSize: z
    .preprocess(
      (value) => (typeof value === 'string' ? Number(value) : value),
      z.number().int().min(1).max(100).optional(),
    )
    .default(50),
});

// Export TypeScript types for external usage
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type VehicleFilters = z.infer<typeof vehicleFiltersSchema>;
