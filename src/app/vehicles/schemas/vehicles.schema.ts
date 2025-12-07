import { VehicleStatus, VehicleType } from '@prisma/client';
import { z } from 'zod';

const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;

export const vehicleSchema = z.object({
  id: z.string().cuid().optional(),
  vin: z.string().regex(vinRegex, 'VIN must be 17 characters').trim(),
  name: z.string().min(1, 'Name is required'),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  status: z.nativeEnum(VehicleStatus).default(VehicleStatus.ACTIVE),
  type: z.nativeEnum(VehicleType).default(VehicleType.TRACTOR),
  plateNumber: z.string().optional(),
  plateState: z.string().optional(),
  odometer: z.number().int().nonnegative().optional(),
  fuelType: z.string().optional(),
  axleCount: z.number().int().positive().optional(),
  organizationId: z.string().cuid().optional(),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;

export const vehicleFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  status: z.nativeEnum(VehicleStatus).optional(),
  type: z.nativeEnum(VehicleType).optional(),
  search: z.string().trim().optional(),
});

export type VehicleFilters = z.infer<typeof vehicleFiltersSchema>;
