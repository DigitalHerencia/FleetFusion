import { z } from 'zod';

export const onboardingStepSchema = z.enum(['company_profile', 'team_setup', 'complete']);
export const onboardingSchema = z.object({
  step: onboardingStepSchema,
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
