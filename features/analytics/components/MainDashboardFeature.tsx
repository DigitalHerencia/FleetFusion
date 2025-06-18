import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardSummary } from '@/lib/fetchers/analyticsFetchers';

interface MainDashboardFeatureProps {
  orgId: string;
}

export async function MainDashboardFeature({
  orgId,
}: MainDashboardFeatureProps) {
  if (!orgId) {
    return <p className="text-red-500">Organization not found.</p>;
  }

  let summary: any;
  try {
    summary = await getDashboardSummary(orgId);
  } catch (err) {
    return <p className="text-red-500">Failed to load analytics.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">
            {'$' + summary.totalRevenue.toLocaleString()}
          </span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Miles</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{summary.totalMiles}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Loads</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{summary.totalLoads}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{summary.activeDrivers}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{summary.activeVehicles}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Revenue per Mile</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">
            {'$' + summary.averageRevenuePerMile.toFixed(2)}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
