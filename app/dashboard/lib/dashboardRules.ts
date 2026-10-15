export type DashboardAlert = {
  id: string;
  severity?: 'critical' | 'high' | 'medium' | 'low' | string;
  priority?: number;
  createdAt?: Date | string;
};

export function resolveDashboardPriorityAlerts<T extends DashboardAlert>(alerts: T[]) {
  const rank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  return [...alerts]
    .sort((a, b) => {
      const severity =
        (rank[b.severity?.toLowerCase() ?? ''] ?? 0) - (rank[a.severity?.toLowerCase() ?? ''] ?? 0);
      return (
        severity ||
        (b.priority ?? 0) - (a.priority ?? 0) ||
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
    })
    .slice(0, 5);
}

export function kpiThresholds(value: number, target: number, inverse = false) {
  if (!Number.isFinite(value) || !Number.isFinite(target)) return 'neutral' as const;
  const ratio = target === 0 ? (value === 0 ? 1 : Infinity) : value / target;
  const score = inverse ? 1 / ratio : ratio;
  if (score >= 1) return 'good' as const;
  if (score >= 0.8) return 'warning' as const;
  return 'critical' as const;
}

export function mergeDomainSummaries<T extends Record<string, unknown>>(
  ...summaries: Array<Partial<T> | null | undefined>
): Partial<T> {
  return Object.assign({}, ...summaries.filter(Boolean));
}

export function getDashboardStatusColor(status: string) {
  const normalized = status.toLowerCase();
  if (['good', 'active', 'delivered', 'valid', 'healthy'].includes(normalized)) return 'green';
  if (['warning', 'expiring_soon', 'pending', 'planned', 'assigned'].includes(normalized))
    return 'amber';
  if (['critical', 'expired', 'failed', 'overdue', 'suspended'].includes(normalized)) return 'red';
  return 'slate';
}
