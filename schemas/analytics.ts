import { z } from 'zod';

export const analyticsReportSchema = z.object({
  orgId: z.string().min(1, 'Organization ID is required'),
  timeRange: z.string().default('30d'),
  format: z.enum(['csv', 'pdf']).default('csv'),
  driver: z.string().optional(),
});

export type AnalyticsReportData = z.infer<typeof analyticsReportSchema>;
