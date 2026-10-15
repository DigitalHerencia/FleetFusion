export type { AnalyticsQueryInput, AnalyticsReportInput } from '../schemas/analytics.schema';

export type AnalyticsDashboardSnapshot = {
  period: string;
  kpis: Array<{ id: string; label: string; value: number; format?: string }>;
  charts: Array<{ label: string; value: number }>;
  recentReports: Array<{ id: string; name: string; updatedAt: Date }>;
  recentActivity: Array<{ id: string; eventType: string; occurredAt: Date }>;
};
