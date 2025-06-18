import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getComplianceDashboard } from '@/lib/fetchers/complianceFetchers';

interface ComplianceDashboardProps {
  orgId: string;
}

export async function ComplianceDashboard({ orgId }: ComplianceDashboardProps) {
  if (!orgId) {
    return <p className="text-red-500">Organization not found.</p>;
  }

  let data: any;
  try {
    data = await getComplianceDashboard(orgId);
  } catch (err) {
    return <p className="text-red-500">Failed to load compliance data.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Driver Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">
            {data.driverComplianceRate}%
          </span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">
            {data.vehicleComplianceRate}%
          </span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pending Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{data.pendingDocuments}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Expired Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{data.expiredDocuments}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Inspections</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{data.recentInspections}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Overdue Inspections</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{data.overdueInspections}</span>
        </CardContent>
      </Card>
    </div>
  );
}
