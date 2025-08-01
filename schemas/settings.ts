import { z } from 'zod';

export const CompanyProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().optional(),
  address: z.string().optional(),
  contactEmail: z.string().email(),
});

export const OrganizationSettingsSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  timezone: z.string(),
  logoUrl: z.string().url().optional(),
  address: z.string().optional(),
});

export const UserPreferencesSchema = z.object({
  userId: z.string(),
  theme: z.enum(['light', 'dark']),
  language: z.string(),
  dashboardLayout: z.string().optional(),
});

export const NotificationSettingsSchema = z.object({
  userId: z.string(),
  email: z.boolean(),
  sms: z.boolean(),
  inApp: z.boolean(),
  schedules: z.object({ quietHoursStart: z.string(), quietHoursEnd: z.string() }).optional(),
});

export const BillingSettingsSchema = z.object({
  orgId: z.string(),
  subscriptionTier: z.enum(['free', 'pro', 'enterprise']),
  subscriptionStatus: z.enum(['active', 'inactive', 'trial', 'cancelled']),
  billingEmail: z.string().email(),
});
