import { z } from 'zod';

export const dashboardDateRangeSchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine(({ from, to }) => !from || !to || from <= to, {
    message: 'Start date must be before end date',
    path: ['to'],
  });

export const dashboardFiltersSchema = dashboardDateRangeSchema.extend({
  tab: z.enum(['overview', 'operations', 'compliance', 'financials']).default('overview'),
  refreshIntervalSeconds: z.coerce.number().int().min(0).max(3600).default(0),
});

export const dashboardNotificationSchema = z.object({
  notificationId: z.string().min(1),
});

export const dashboardSystemMessageSchema = z.object({
  messageId: z.string().min(1),
});
