import { z } from 'zod';

export const ProfileSetupSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long'),
  phone: z.string().optional(),
});

export const CompanySetupSchema = z.object({
  dotNumber: z.string().optional(),
  mcNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().default('America/Denver'),
  dateFormat: z.string().default('MM/dd/yyyy'),
  distanceUnit: z.enum(['miles', 'kilometers']).default('miles'),
  fuelUnit: z.enum(['gallons', 'liters']).default('gallons'),
});

export const PreferencesSchema = z.object({
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
  }),
  language: z.string().default('en'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
});

export const OnboardingStepSchema = z.object({
  step: z.enum(['profile', 'company', 'preferences']),
  data: z.union([ProfileSetupSchema, CompanySetupSchema, PreferencesSchema]),
});

export type ProfileSetupFormData = z.infer<typeof ProfileSetupSchema>;
export type CompanySetupFormData = z.infer<typeof CompanySetupSchema>;
export type PreferencesFormData = z.infer<typeof PreferencesSchema>;

export const CompleteOnboardingSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  companyName: z.string(),
  dotNumber: z.string().optional(),
  mcNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  phone: z.string().optional(),
  organizationId: z.string().optional(),
  inviteCode: z.string().optional(),
  preferences: z.record(z.any()).optional(),
});

export type CompleteOnboardingData = z.infer<typeof CompleteOnboardingSchema>;
