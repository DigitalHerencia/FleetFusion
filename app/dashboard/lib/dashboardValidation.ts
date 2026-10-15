import { dashboardFiltersSchema } from '../schemas/dashboard.schema';

export function parseDashboardFilters(input: unknown = {}) {
  return dashboardFiltersSchema.parse(input);
}

export function dashboardDateWhere(range: { from?: Date; to?: Date }) {
  if (!range.from && !range.to) return undefined;
  return {
    gte: range.from,
    lte: range.to,
  };
}
