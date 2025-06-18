import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrganizationStatsAction } from '@/lib/actions/adminActions';

interface AdminDashboardProps {
  orgId: string;
  userId?: string; // Optional userId if needed for future features
}

export async function AdminDashboard({ orgId }: AdminDashboardProps) {
  if (!orgId) {
    return <p className="text-red-500">Organization not found.</p>;
  }

  const result = await getOrganizationStatsAction(orgId);
  if (!result.success || !result.data) {
    return (
      <p className="text-red-500">
        {result.error || 'Failed to load organization stats.'}
      </p>
    );
  }

  const stats = result.data as {
    userCount: number;
    activeUserCount: number;
    vehicleCount: number;
    driverCount: number;
    loadCount: number;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{stats.userCount}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{stats.activeUserCount}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{stats.driverCount}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{stats.vehicleCount}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Loads</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{stats.loadCount}</span>
        </CardContent>
      </Card>
    </div>
  );
}
