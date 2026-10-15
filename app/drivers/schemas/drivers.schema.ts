import { z } from 'zod';

export const driverSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.email().nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED']).optional(),
  licenseNumber: z.string().trim().max(80).nullable().optional(),
  licenseState: z
    .string()
    .trim()
    .length(2)
    .transform((value) => value.toUpperCase())
    .nullable()
    .optional(),
  licenseExpiry: z.coerce.date().nullable().optional(),
  organizationId: z.string().optional(),
});

export const driverFiltersSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED']).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(25),
});

export const driverStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED']),
});

export const bulkDriverImportSchema = z.object({
  rows: z.array(z.unknown()).min(1).max(500),
});
