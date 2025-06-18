/**
 * Driver Dashboard Page
 *
 * Individual driver dashboard for viewing assigned loads, HOS status, and compliance info
 */

import { Suspense, type JSX } from 'react';
import { Clock } from 'lucide-react';
import { notFound } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getDriverById } from '@/lib/fetchers/driverFetchers';
import { DriverFormFeature } from '@/features/drivers/components/DriverFormFeature';
import { DriverPerformance } from '@/components/analytics/driver-performance';
import { getDriverAnalytics } from '@/lib/fetchers/analyticsFetchers';
import { DocumentUploadForm } from '@/components/compliance/DocumentUploadForm';
import { getDriverHOSStatus } from '@/lib/fetchers/complianceFetchers';
import { AssignmentDialogButton } from '@/features/drivers/components/AssignmentDialogButton'; // new client component

// Helper to safely extract assignment info
function getAssignmentLabel(assignment: any) {
  if (assignment && typeof assignment === 'object') {
    return (
      assignment.loadId || assignment.vehicleId || assignment.trailerId || 'N/A'
    );
  }
  return 'N/A';
}

export default async function DriverDashboardPage({
  params,
}: {
  params: Promise<{ orgId: string; userId: string }>;
}): Promise<JSX.Element> {
  const { orgId, userId } = await params;
  // Fetch driver data by ID and org for multitenancy support
  const driverData = await getDriverById(userId, orgId);
  if (!driverData) return notFound();
  // Real-time status: poll HOS status and assignment every 10s
  const hosStatus = await getDriverHOSStatus(userId);
  let currentStatus: string = driverData.status;
  if (hosStatus && typeof hosStatus === 'object') {
    const hs = hosStatus as any;
    if (hs.data && typeof hs.data.currentStatus === 'string') {
      currentStatus = hs.data.currentStatus;
    }
  }
  // Fetch analytics for this driver
  const analytics = await getDriverAnalytics(orgId, '30d');
  const driverAnalytics = Array.isArray(analytics)
    ? analytics.find(a => a.id === driverData.id)
    : null;

  return (
    <>
      <div className="space-y-6 p-6 pt-8">
        {/* Page Header with real-time status */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Driver Dashboard
            </h1>
            <p className="text-muted-foreground">
              Status: <span className="font-semibold">{currentStatus}</span>
              <span className="ml-4">
                Assigned to:{' '}
                <span className="font-semibold">
                  {getAssignmentLabel(driverData.currentAssignment)}
                </span>
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 text-green-700"
            >
              On Duty
            </Badge>
            <Button
              variant="default"
              className="border border-gray-200 bg-black hover:bg-neutral-800"
            >
              <Clock className="mr-2 h-4 w-4" />
              Log Hours
            </Button>
          </div>
        </div>

        {/* HOS Status */}
        <HosStatusCards hosStatus={hosStatus} />

        {/* Current Load */}
        <CurrentLoadCard assignment={driverData.currentAssignment} />        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <UpcomingLoadsCard driverId={driverData.id} orgId={orgId} />
          <RecentActivityCard driverId={driverData.id} orgId={orgId} />
        </div>        {/* Document Status */}
        <DocumentStatusCard driverId={driverData.id} orgId={orgId} />

        {/* Performance Metrics */}
        <PerformanceOverviewCard analytics={driverAnalytics} />

        {/* Driver Profile Edit */}
        <Card className="bg-black">
          <CardHeader>
            <CardTitle>Edit Profile & Documents</CardTitle>
            <CardDescription>
              Update your driver profile and upload compliance documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingSpinner />}>
              <DriverFormFeature
                initialValues={driverData}
                mode="edit"
                driverId={driverData.id}
                orgId={orgId}
              />
            </Suspense>
          </CardContent>
        </Card>

        {/* Assignment Button (client only) */}
        <div className="mb-4 flex justify-end">
          <AssignmentDialogButton
            driverId={driverData.id}
            currentAssignment={driverData.currentAssignment}
          />
        </div>

        {/* Analytics Section */}
        {driverAnalytics && (
          <div className="mb-8">
            <DriverPerformance
              driverPerformanceMetrics={[driverAnalytics]}
              timeRange="30d"
            />
          </div>
        )}

        {/* Document Upload Section */}
        <Card className="bg-black">
          <CardHeader>
            <CardTitle>Upload Compliance Document</CardTitle>
            <CardDescription>
              Upload a new document for this driver
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUploadForm
              onUpload={() => {}}
              entityType="driver"
              entityId={driverData.id}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// --- Server Components for dashboard sections ---

function HosStatusCards({ hosStatus }: { hosStatus: any }) {
  // Extract HOS data from the fetcher response
  const hosData = hosStatus?.data || null;
  
  // Default values if no HOS data available
  const defaultData = {
    currentStatus: 'off_duty',
    availableDriveTime: 660, // 11 hours in minutes
    availableOnDutyTime: 840, // 14 hours in minutes
    usedDriveTime: 0,
    usedOnDutyTime: 0,
    cycleHours: 4200, // 70 hours in minutes
    usedCycleHours: 0,
    violations: [],
    complianceStatus: 'pending'
  };

  const data = hosData || defaultData;

  // Helper function to format time in hours:minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  // Helper to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'driving': return 'bg-blue-100 text-blue-800';
      case 'on_duty': return 'bg-green-100 text-green-800';
      case 'off_duty': return 'bg-gray-100 text-gray-800';
      case 'sleeper_berth': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Current Status */}
      <Card className="bg-black">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-300">
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(data.currentStatus)}>
              {data.currentStatus.replace('_', ' ').toUpperCase()}
            </Badge>
            <div className="text-right">
              <div className="text-xs text-gray-400">Compliance</div>
              <div className={`text-xs font-medium ${
                data.complianceStatus === 'compliant' ? 'text-green-400' :
                data.complianceStatus === 'violation' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {data.complianceStatus.toUpperCase()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drive Time */}
      <Card className="bg-black">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-300">
            Drive Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatTime(data.availableDriveTime)}
          </div>
          <p className="text-xs text-gray-400">
            Remaining of 11:00 limit
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${((660 - data.availableDriveTime) / 660) * 100}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* On-Duty Time */}
      <Card className="bg-black">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-300">
            On-Duty Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatTime(data.availableOnDutyTime)}
          </div>
          <p className="text-xs text-gray-400">
            Remaining of 14:00 limit
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${((840 - data.availableOnDutyTime) / 840) * 100}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* 70-Hour Cycle */}
      <Card className="bg-black">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-300">
            70-Hour Cycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatTime(data.cycleHours - data.usedCycleHours)}
          </div>
          <p className="text-xs text-gray-400">
            Remaining of 70:00 limit
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full" 
              style={{ width: `${(data.usedCycleHours / data.cycleHours) * 100}%` }}
            ></div>
          </div>
          {data.violations?.length > 0 && (
            <div className="mt-2 text-xs text-red-400">
              {data.violations.length} violation(s)
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CurrentLoadCard({ assignment }: { assignment: any }) {
  // Extract current load data from assignment
  const hasAssignment = assignment && typeof assignment === 'object';
  const loadData = hasAssignment ? assignment : null;

  return (
    <Card className="bg-black">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">Current Load</CardTitle>
          {hasAssignment && (
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
              Active
            </Badge>
          )}
        </div>
        <CardDescription className="text-gray-400">
          {hasAssignment ? 'Currently assigned load details' : 'No active load assignment'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasAssignment ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Load ID</p>
                <p className="font-semibold text-white">{loadData.loadId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Priority</p>
                <Badge variant="outline" className={
                  loadData.priority === 'high' ? 'border-red-200 bg-red-50 text-red-700' :
                  loadData.priority === 'medium' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                  'border-green-200 bg-green-50 text-green-700'
                }>
                  {loadData.priority || 'Normal'}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Origin</p>
                <p className="font-semibold text-white">
                  {loadData.origin?.city ? `${loadData.origin.city}, ${loadData.origin.state}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Destination</p>
                <p className="font-semibold text-white">
                  {loadData.destination?.city ? `${loadData.destination.city}, ${loadData.destination.state}` : 'N/A'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Vehicle</p>
                <p className="font-semibold text-white">{loadData.vehicleId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Trailer</p>
                <p className="font-semibold text-white">{loadData.trailerId || 'N/A'}</p>
              </div>
            </div>
            {loadData.pickupDate && (
              <div>
                <p className="text-sm text-gray-400">Pickup Date</p>
                <p className="font-semibold text-white">
                  {new Date(loadData.pickupDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {loadData.deliveryDate && (
              <div>
                <p className="text-sm text-gray-400">Delivery Date</p>
                <p className="font-semibold text-white">
                  {new Date(loadData.deliveryDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No active load assignment</p>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              View Available Loads
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function UpcomingLoadsCard({ driverId, orgId }: { driverId: string; orgId: string }) {
  // Import the load fetcher
  const { listLoadsByOrg } = await import('@/lib/fetchers/dispatchFetchers');
  
  try {
    // Fetch upcoming loads for this organization and filter by driver
    const loadResponse = await listLoadsByOrg(orgId);
    const loads = loadResponse.success ? loadResponse.data.loads : [];
    
    const upcomingLoads = loads
      .filter((load: any) => 
        load.assignedDriverId === driverId && 
        load.status === 'assigned' &&
        new Date(load.pickupDate) > new Date()
      )
      .sort((a: any, b: any) => new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime())
      .slice(0, 3); // Show next 3 upcoming loads

    return (
      <Card className="bg-black">
        <CardHeader>
          <CardTitle className="text-lg text-white">Upcoming Loads</CardTitle>
          <CardDescription className="text-gray-400">
            Next scheduled assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingLoads.length > 0 ? (
            <div className="space-y-4">
              {upcomingLoads.map((load: any) => (
                <div key={load.id} className="border border-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-white">{load.loadId || load.id}</p>
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-xs">
                      {load.priority || 'Normal'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>
                      {load.origin || 'Origin'} → {load.destination || 'Destination'}
                    </p>
                    <p>Pickup: {load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : 'TBD'}</p>
                    {load.deliveryDate && (
                      <p>Delivery: {new Date(load.deliveryDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No upcoming loads scheduled</p>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                View Load Board
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error fetching upcoming loads:', error);
    return (
      <Card className="bg-black">
        <CardHeader>
          <CardTitle className="text-lg text-white">Upcoming Loads</CardTitle>
          <CardDescription className="text-gray-400">
            Next scheduled assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Unable to load upcoming assignments</p>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
}

async function RecentActivityCard({ driverId, orgId }: { driverId: string; orgId: string }) {
  // Import the dispatch activity fetcher
  const { getRecentDispatchActivity } = await import('@/lib/fetchers/dispatchFetchers');
  
  try {
    // Fetch recent dispatch activity and filter for this driver
    const activityResponse = await getRecentDispatchActivity(orgId, 7); // Last 7 days
    const activities = activityResponse.success ? activityResponse.data : [];
    
    // Filter activities for this specific driver
    const driverActivities = activities
      .filter((activity: any) => activity.driverId === driverId || activity.entityId === driverId)
      .slice(0, 5); // Show latest 5 activities

    return (
      <Card className="bg-black">
        <CardHeader>
          <CardTitle className="text-lg text-white">Recent Activity</CardTitle>
          <CardDescription className="text-gray-400">
            Latest driver actions and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {driverActivities.length > 0 ? (
            <div className="space-y-4">
              {driverActivities.map((activity: any, index: number) => (
                <div key={activity.id || index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white">
                      {activity.action || activity.description || 'Activity recorded'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 
                       activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'Recent'}
                    </div>
                    {activity.details && (
                      <div className="text-xs text-gray-500 mt-1">
                        {activity.details}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No recent activity found</p>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                View Full History
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return (
      <Card className="bg-black">
        <CardHeader>
          <CardTitle className="text-lg text-white">Recent Activity</CardTitle>
          <CardDescription className="text-gray-400">
            Latest driver actions and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Unable to load recent activity</p>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
}

async function DocumentStatusCard({ driverId, orgId }: { driverId: string; orgId: string }) {
  // Import the compliance document fetcher
  const { getComplianceDocuments } = await import('@/lib/fetchers/complianceFetchers');
  
  try {    // Fetch compliance documents for this driver
    const documentsResponse = await getComplianceDocuments({
      entityType: ['driver'],
      entityId: driverId
    });
    const documents = (documentsResponse.success && 'data' in documentsResponse) 
      ? documentsResponse.data.documents 
      : [];
    
    // Calculate document status summary
    const now = new Date();
    const expiringSoon = documents.filter((doc: any) => {
      const expiryDate = new Date(doc.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    });
    
    const expired = documents.filter((doc: any) => {
      const expiryDate = new Date(doc.expiryDate);
      return expiryDate < now;
    });
    
    const valid = documents.filter((doc: any) => {
      const expiryDate = new Date(doc.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 30;
    });

    return (
      <Card className="bg-black">
        <CardHeader>
          <CardTitle className="text-lg text-white">Document Status</CardTitle>
          <CardDescription className="text-gray-400">
            Compliance document overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{valid.length}</div>
              <div className="text-sm text-gray-400">Valid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{expiringSoon.length}</div>
              <div className="text-sm text-gray-400">Expiring Soon</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{expired.length}</div>
              <div className="text-sm text-gray-400">Expired</div>
            </div>
          </div>
          
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.slice(0, 4).map((doc: any) => {
                const expiryDate = new Date(doc.expiryDate);
                const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isExpired = expiryDate < now;
                const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                
                return (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
                    <div>
                      <p className="font-semibold text-white">{doc.documentType || doc.name}</p>
                      <p className="text-sm text-gray-400">
                        Expires: {expiryDate.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className={
                      isExpired ? 'border-red-200 bg-red-50 text-red-700' :
                      isExpiringSoon ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                      'border-green-200 bg-green-50 text-green-700'
                    }>
                      {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Valid'}
                    </Badge>
                  </div>
                );
              })}
              
              {documents.length > 4 && (
                <div className="text-center pt-2">
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    View All Documents ({documents.length})
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No compliance documents found</p>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                Upload Documents
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error fetching document status:', error);
    return (
      <Card className="bg-black">
        <CardHeader>
          <CardTitle className="text-lg text-white">Document Status</CardTitle>
          <CardDescription className="text-gray-400">
            Compliance document overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Unable to load document status</p>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
}

function PerformanceOverviewCard({ analytics }: { analytics: any }) {
  // Use the analytics data passed from the parent component
  const performanceData = analytics || null;

  return (
    <Card className="bg-black">
      <CardHeader>
        <CardTitle className="text-lg text-white">Performance Overview</CardTitle>
        <CardDescription className="text-gray-400">
          Last 30 days performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {performanceData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {performanceData.totalLoads || performanceData.loadsCompleted || 0}
              </div>
              <div className="text-sm text-gray-400">Loads Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {performanceData.totalRevenue ? 
                  `$${performanceData.totalRevenue.toLocaleString()}` : 
                  performanceData.revenue ? 
                  `$${performanceData.revenue.toLocaleString()}` : '$0'}
              </div>
              <div className="text-sm text-gray-400">Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {performanceData.totalMiles ? 
                  performanceData.totalMiles.toLocaleString() :
                  performanceData.miles ? 
                  performanceData.miles.toLocaleString() : '0'}
              </div>
              <div className="text-sm text-gray-400">Miles Driven</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {performanceData.onTimeDeliveryRate ? 
                  `${Math.round(performanceData.onTimeDeliveryRate * 100)}%` :
                  performanceData.onTimeRate ?
                  `${Math.round(performanceData.onTimeRate * 100)}%` : '0%'}
              </div>
              <div className="text-sm text-gray-400">On-Time Rate</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No performance data available</p>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              View Detailed Analytics
            </Button>
          </div>
        )}
        
        {performanceData && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Safety Score:</span>
                <span className="text-white font-semibold">
                  {performanceData.safetyScore ? 
                    `${performanceData.safetyScore}/100` : 
                    'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fuel Efficiency:</span>
                <span className="text-white font-semibold">
                  {performanceData.fuelEfficiency ? 
                    `${performanceData.fuelEfficiency} MPG` : 
                    'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg. Rating:</span>
                <span className="text-white font-semibold">
                  {performanceData.averageRating ? 
                    `${performanceData.averageRating}/5.0` : 
                    'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">HOS Violations:</span>
                <span className={`font-semibold ${
                  (performanceData.hosViolations || 0) > 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {performanceData.hosViolations || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
