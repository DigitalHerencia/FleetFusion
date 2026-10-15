export type DashboardTab = 'overview' | 'operations' | 'compliance' | 'financials';
export type DashboardKpi = { label: string; value: string | number; detail?: string };
export type DashboardDateRange = { from?: Date; to?: Date };
export type DashboardAlert = { id: string; severity?: string; title?: string; createdAt?: Date };
