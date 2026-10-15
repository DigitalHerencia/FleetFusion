import { z } from 'zod';

export const notificationTypeSchema = z.enum(['SYSTEM', 'ALERT', 'REMINDER', 'DIGEST']);
export const notificationChannelSchema = z.enum(['IN_APP', 'EMAIL', 'SMS']);
export const notificationStatusSchema = z.enum(['PENDING', 'SENT', 'FAILED', 'READ']);

export const notificationPreferenceSchema = z.object({
  emailEnabled: z.boolean().default(true),
  smsEnabled: z.boolean().default(false),
  inAppEnabled: z.boolean().default(true),
  categories: z.record(z.string(), z.boolean()).default({}),
});

export const notificationFiltersSchema = z.object({
  type: notificationTypeSchema.optional(),
  channel: notificationChannelSchema.optional(),
  unreadOnly: z.coerce.boolean().default(false),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const sendSystemNotificationSchema = z.object({
  userId: z.string().min(1).optional(),
  type: notificationTypeSchema.default('SYSTEM'),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10000),
  payload: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
