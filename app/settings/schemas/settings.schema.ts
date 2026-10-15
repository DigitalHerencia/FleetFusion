import { z } from 'zod';

export const orgProfileSchema = z.object({
  name: z.string().trim().min(1).max(160),
  timezone: z.string().trim().min(1).max(80),
  legalName: z.string().trim().max(160).nullable().optional(),
  dbaName: z.string().trim().max(160).nullable().optional(),
  dotNumber: z.string().trim().max(32).nullable().optional(),
  mcNumber: z.string().trim().max(32).nullable().optional(),
  addressLine1: z.string().trim().max(160).nullable().optional(),
  addressLine2: z.string().trim().max(160).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  state: z.string().trim().max(80).nullable().optional(),
  postalCode: z.string().trim().max(24).nullable().optional(),
  country: z.string().trim().max(80).nullable().optional(),
});

export const memberRoleSchema = z.object({
  membershipId: z.string().trim().min(1).max(191),
  role: z.enum([
    'OWNER',
    'ADMIN',
    'MANAGER',
    'DISPATCHER',
    'DRIVER_MANAGER',
    'COMPLIANCE_MANAGER',
    'ANALYST',
    'BILLING',
    'MEMBER',
  ]),
});

export const featureFlagsSchema = z.object({
  flags: z
    .record(z.string().trim().min(1).max(100), z.boolean())
    .refine(
      (flags) => Object.keys(flags).length <= 100,
      'No more than 100 feature flags can be updated at once.',
    ),
});

export const subscriptionSchema = z.object({
  planKey: z.enum(['starter', 'growth', 'enterprise']),
});
