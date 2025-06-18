/**
 * Dashboard Metrics Component
 *
 * Displays key performance indicators and metrics cards
 */

import {
  Truck,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { FC } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardSummary } from '@/lib/fetchers/analyticsFetchers';
import type { DashboardSummary } from '@/types/analytics';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}

function MetricCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
}: MetricCardProps) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-muted-foreground',
  }[changeType];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${changeColor} flex items-center gap-1`}>
          <TrendingUp className="h-3 w-3" />
          {change}
        </p>
      </CardContent>
    </Card>
  );
}

interface DashboardMetricsProps {
  orgId: string;
}

const DashboardMetrics: FC<DashboardMetricsProps> = async ({ orgId }) => {
  if (!orgId) {
    return <div className="text-red-500">Organization not found</div>;
  }
  let summary: DashboardSummary;
  try {
    summary = await getDashboardSummary(orgId);
  } catch (e) {
    return <div className="text-red-500">Failed to load metrics</div>;
  }

  const metrics = [
    {
      title: 'Active Vehicles',
      value: summary.activeVehicles.toString(),
      change: '',
      changeType: 'neutral' as const,
      icon: Truck,
    },
    {
      title: 'Active Drivers',
      value: summary.activeDrivers.toString(),
      change: '',
      changeType: 'neutral' as const,
      icon: Users,
    },
    {
      title: 'Active Loads',
      value: summary.totalLoads.toString(),
      change: '',
      changeType: 'neutral' as const,
      icon: Package,
    },
    {
      title: 'Revenue (MTD)',
      value: `$${summary.totalRevenue.toLocaleString()}`,
      change: '',
      changeType: 'neutral' as const,
      icon: DollarSign,
    },
    {
      title: 'Revenue per Mile',
      value: `$${summary.averageRevenuePerMile.toFixed(2)}`,
      change: '',
      changeType: 'neutral' as const,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map(metric => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          changeType={metric.changeType}
          icon={metric.icon}
        />
      ))}
    </div>
  );
};

export default DashboardMetrics;
