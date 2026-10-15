import { z } from 'zod';

export const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(320)
    .transform((value) => value.toLowerCase()),
  name: z.string().trim().min(1).max(160),
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  externalId: z.string().trim().min(1).max(255).optional(),
  password: z.string().min(8).max(256).optional(),
  profile: z
    .object({
      firstName: z.string().trim().min(1).max(80),
      lastName: z.string().trim().min(1).max(80),
    })
    .optional(),
});

export const onboardingSchema = z.object({
  step: z.enum(['company_profile', 'team_setup', 'complete']),
  companyName: z.string().trim().min(1).max(160).optional(),
  timezone: z.string().trim().min(1).max(80).optional(),
  legalName: z.string().trim().max(160).optional(),
  dbaName: z.string().trim().max(160).optional(),
  dotNumber: z.string().trim().max(32).optional(),
  mcNumber: z.string().trim().max(32).optional(),
  addressLine1: z.string().trim().max(160).optional(),
  addressLine2: z.string().trim().max(160).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(80).optional(),
  postalCode: z.string().trim().max(24).optional(),
  country: z.string().trim().max(80).optional(),
});
