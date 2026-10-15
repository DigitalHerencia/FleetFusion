import { z } from 'zod';

export const analyticsRanges = [
  'last_7d',
  'last_30d',
  'last_90d',
  'this_year',
  'all',
  'realtime',
] as const;
export const analyticsKpis = [
  'activity_events',
  'live',
  'dashboard_views',
  'reports_run',
  'exports_run',
  'active_vehicles',
  'active_drivers',
  'active_loads',
  'delivered_loads',
  'expiring_documents',
  'on_time_rate',
] as const;
export const reportTemplates = ['kpi', 'table', 'chart'] as const;

const stringRecord = z.record(z.string(), z.unknown()).default({});

export const analyticsQuerySchema = z.object({
  kpi: z.enum(analyticsKpis).default('activity_events'),
  range: z.enum(analyticsRanges).default('last_30d'),
  filters: stringRecord,
  queryId: z.string().optional(),
});

export const analyticsReportSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Report name is required').max(120),
  description: z.string().trim().max(1000).nullable().optional(),
  template: z.enum(reportTemplates).default('kpi'),
  kpi: z.enum(analyticsKpis).default('activity_events'),
  range: z.enum(analyticsRanges).default('last_30d'),
  config: stringRecord,
});

export const analyticsReportUpdateSchema = analyticsReportSchema.extend({
  id: z.string().trim().min(1),
});

export const analyticsQueryBuilderSchema = analyticsQuerySchema.extend({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).optional(),
});

export type AnalyticsQueryInput = z.input<typeof analyticsQuerySchema>;
export type AnalyticsReportInput = z.input<typeof analyticsReportSchema>;
