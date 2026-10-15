import { z } from 'zod';

export const inviteCreateSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(320)
    .transform((value) => value.toLowerCase()),
  role: z.enum([
    'owner',
    'admin',
    'manager',
    'dispatcher',
    'driver_manager',
    'compliance_manager',
    'analyst',
    'billing',
    'member',
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

export const inviteAcceptSchema = z.object({
  token: z.string().trim().min(32).max(256),
});
