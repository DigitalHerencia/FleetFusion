import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getComplianceDashboard } from '@/lib/fetchers/complianceFetchers';
import type { ComplianceDashboardData } from '@/types/compliance';

import React from 'react';

interface ComplianceDashboardProps {
  orgId: string;
}
/**
 * Server component displaying compliance statistics.
 *
 * @param props.orgId - Organization identifier used to load compliance data.
 *
 * Metrics grid adapts from two to three columns responsively.
 */

export async function ComplianceDashboard({ orgId }: ComplianceDashboardProps) {
  if (!orgId) {
    return <p className="text-red-500">Organization not found.</p>;
  }

  let data: ComplianceDashboardData;
  try {
    data = await getComplianceDashboard(orgId);
  } catch (err) {
    return <p className="text-red-500">Failed to load compliance data.</p>;
  }

  return (
    <div className="flex flex-row gap-2">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Driver Compliance</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <span className="text-3xl font-bold">{data.driverComplianceRate}%</span>
        </CardContent>
      </Card>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Vehicle Compliance</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <span className="text-3xl font-bold">{data.vehicleComplianceRate}%</span>
        </CardContent>
      </Card>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Pending Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <span className="text-3xl font-bold">{data.pendingDocuments}</span>
        </CardContent>
      </Card>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Expired Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <span className="text-3xl font-bold">{data.expiredDocuments}</span>
        </CardContent>
      </Card>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Inspections</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <span className="text-3xl font-bold">{data.recentInspections}</span>
        </CardContent>
      </Card>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Overdue Inspections</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <span className="text-3xl font-bold">{data.overdueInspections}</span>
        </CardContent>
      </Card>
    </div>
  );
}
