'use server';

/**
 * Dashboard server actions.
 */

import { billingInfoSchema } from '@/schemas/dashboard';
import type { BillingInfo } from '@/types/dashboard';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import db from '@/lib/database/db';
import { handleError } from '@/lib/errors/handleError';
import { getOrganizationKPIs } from '@/lib/fetchers/dashboardFetchers';
import type {
  OrganizationKPIs,
  DashboardActionResult,
  DashboardAlert,
  DashboardScheduleItem,
} from '@/types/dashboard';
import { Readable } from 'node:stream';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { put } from '@vercel/blob';
import { string } from 'zod';

/**
 * Get organization billing info
 */
export async function getOrganizationBillingAction(
  orgId: string,
): Promise<DashboardActionResult<BillingInfo>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    // Fetch org from DB
    const org = await db.organization.findUnique({
      where: { id: orgId },
      select: { subscriptionTier: true, subscriptionStatus: true, maxUsers: true },
    });
    if (!org) return { success: false, error: 'Organization not found' };

    const usersCount = await db.user.count({ where: { organizationId: orgId } });
    const vehiclesCount = await db.vehicle.count({ where: { organizationId: orgId } });
    const maxVehicles = 1;
    const billingData = {
      plan: org.subscriptionTier || 'free',
      status: org.subscriptionStatus || 'inactive',
      currentPeriodEnds: '',
      usage: {
        users: usersCount,
        maxUsers: org.maxUsers ?? 1,
        vehicles: vehiclesCount,
        maxVehicles,
      },
    };
    const parsed = billingInfoSchema.safeParse(billingData);
    if (!parsed.success) {
      return { success: false, error: 'Invalid billing data' };
    }
    return { success: true, data: parsed.data };
  } catch (error) {
    return handleError(error, 'Get Organization Billing Info');
  }
}

export async function cancelSubscriptionAction(
  orgId: string,
): Promise<DashboardActionResult<{ message: string }>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, role: true },
    });
    if (!user || user.organizationId !== orgId || user.role !== 'admin') {
      return { success: false, error: 'Forbidden' };
    }

    const apiUrl = process.env.BILLING_PROVIDER_API_URL;
    const apiKey = process.env.BILLING_PROVIDER_API_KEY;
    if (!apiUrl || !apiKey) {
      throw new Error('Billing provider API not configured');
    }

    const res = await fetch(`${apiUrl}/subscriptions/${orgId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Billing provider error: ${res.status} ${text}`);
    }

    await db.organization.update({
      where: { id: orgId },
      data: { subscriptionStatus: 'cancelled' },
    });

    revalidatePath(`/${orgId}/dashboard`);
    return { success: true, data: { message: 'Subscription cancelled' } };
  } catch (error) {
    return handleError(error, 'Cancel Subscription');
  }
}

export async function activateUsersAction(
  orgId: string,
  formData: FormData,
): Promise<DashboardActionResult<{ activated: string[] }>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };
    const userIdsRaw = formData.get('userIds') as string | null;
    const activated: string[] = [];
    if (userIdsRaw && userIdsRaw.trim()) {
      const userIds = userIdsRaw
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);
      for (const id of userIds) {
        const user = await db.user.update({ where: { id }, data: { isActive: true } });
        activated.push(user.email || id);
      }
    } else {
      // Activate all inactive users in org
      const users = await db.user.findMany({ where: { organizationId: orgId, isActive: false } });
      for (const user of users) {
        await db.user.update({ where: { id: user.id }, data: { isActive: true } });
        activated.push(user.email || user.id);
      }
    }
    revalidatePath(`/${orgId}/dashboard`);
    return { success: true, data: { activated } };
  } catch (error) {
    return handleError(error, 'Activate Users');
  }
}

export async function deactivateUsersAction(
  orgId: string,
  formData: FormData,
): Promise<DashboardActionResult<{ deactivated: string[] }>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };
    const userIdsRaw = formData.get('userIds') as string;
    if (!userIdsRaw) return { success: false, error: 'User IDs are required.' };
    const userIds = userIdsRaw
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
    const deactivated: string[] = [];
    for (const id of userIds) {
      const user = await db.user.update({ where: { id }, data: { isActive: false } });
      deactivated.push(user.email || id);
    }
    revalidatePath(`/${orgId}/dashboard`);
    return { success: true, data: { deactivated } };
  } catch (error) {
    return handleError(error, 'Deactivate Users');
  }
}

// Single, corrected export action:
export async function exportOrganizationDataAction(
  orgId: string,
  formData: FormData,
): Promise<DashboardActionResult<{ downloadUrl: string }>> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const exportType = (formData.get('exportType') as string) || 'users';
    const format = (formData.get('format') as string) || 'csv';

    const rows: Record<string, any>[] = [];

    if (exportType === 'users' || exportType === 'full') {
      const users = await db.user.findMany({
        where: { organizationId: orgId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });
      users.forEach((u) =>
        rows.push({
          id: u.id,
          email: u.email ?? '',
          firstName: u.firstName ?? '',
          lastName: u.lastName ?? '',
          role: u.role,
        }),
      );
    }

    if (exportType === 'vehicles' || exportType === 'full') {
      const vehicles = await db.vehicle.findMany({
        where: { organizationId: orgId },
        select: { id: true, unitNumber: true, vin: true, type: true },
      });
      vehicles.forEach((v) =>
        rows.push({
          id: v.id,
          unitNumber: v.unitNumber ?? '',
          vin: v.vin ?? '',
          type: v.type,
        }),
      );
    }

    if (!rows.length) {
      return { success: false, error: 'No data found for export' };
    }

    let buffer: Buffer;
    const ext = format === 'pdf' ? 'pdf' : 'csv';

    if (format === 'pdf') {
      const doc = await PDFDocument.create();
      const page = doc.addPage();
      const { height } = page.getSize();
      const font = await doc.embedFont(StandardFonts.Helvetica);

      if (rows.length > 0) {
        const headers = Object.keys(string(rows[0]));
        let y = height - 40;
        page.drawText(headers.join(' | '), { x: 50, y, size: 12, font });
        y -= 20;
        rows.forEach((r) => {
          const line = headers.map((h) => String(r[h] ?? '')).join(' | ');
          page.drawText(line, { x: 50, y, size: 10, font });
          y -= 15;
        });
        buffer = Buffer.from(await doc.save());
      } else {
        // fallback to empty file
        buffer = Buffer.from('');
      }
    } else {
      const headers = Object.keys(string(rows[0]));
      const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
      const csv = [headers.join(',')];
      rows.forEach((r) => {
        csv.push(headers.map((h) => escape(String(r[h] ?? ''))).join(','));
      });
      buffer = Buffer.from(csv.join('\n'));
    }

    const token = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
    if (!token) throw new Error('Blob read-write token not configured');

    const pathname = `${orgId}/export-${Date.now()}.${ext}`; // Unique filename with timestamp
    if (pathname.length > 200) {
      return { success: false, error: 'Export filename too long' };
    }
    // Only 'public' is allowed for the 'access' parameter.
    const { downloadUrl } = await put(pathname, Readable.from(buffer), {
      access: 'public',
      token,
    });

    return { success: true, data: { downloadUrl } };
  } catch (error) {
    return handleError(error, 'Export Organization Data');
  }
}

export async function getDashboardOverviewAction(): Promise<
  DashboardActionResult<OrganizationKPIs>
> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, role: true },
    });

    if (!user?.organizationId) {
      return { success: false, error: 'User organization not found' };
    }

    const overview = await getOrganizationKPIs(user.organizationId);

    // Revalidate to keep dashboard data fresh
    revalidatePath('/dashboard');
    revalidatePath('/');

    return { success: true, data: overview };
  } catch (error) {
    return handleError(error, 'Get Dashboard Overview');
  }
}

export async function getDashboardAlertsAction(
  organizationId: string,
): Promise<DashboardActionResult<DashboardAlert[]>> {
  if (!organizationId) {
    return { success: false, error: 'Organization ID is required.' };
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const alerts: Array<{
      id: string;
      message: string;
      severity: string;
      timestamp: string;
      type: string;
    }> = [];
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // 1. Vehicle maintenance alerts
    const vehicleMaintenanceAlerts = await db.vehicle.findMany({
      where: {
        organizationId,
        OR: [
          {
            nextInspectionDue: {
              lte: thirtyDaysFromNow,
            },
          },
          {
            insuranceExpiration: {
              lte: thirtyDaysFromNow,
            },
          },
          {
            registrationExpiration: {
              lte: thirtyDaysFromNow,
            },
          },
        ],
      },
      select: {
        id: true,
        unitNumber: true,
        nextInspectionDue: true,
        insuranceExpiration: true,
        registrationExpiration: true,
      },
    });

    vehicleMaintenanceAlerts.forEach((vehicle) => {
      if (vehicle.nextInspectionDue && vehicle.nextInspectionDue <= thirtyDaysFromNow) {
        const daysUntilDue = Math.ceil(
          (vehicle.nextInspectionDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        alerts.push({
          id: `vehicle-inspection-${vehicle.id}`,
          message: `Vehicle ${vehicle.unitNumber} inspection ${
            daysUntilDue <= 0 ? 'overdue' : `due in ${daysUntilDue} days`
          }`,
          severity: daysUntilDue <= 7 ? 'high' : 'medium',
          timestamp: new Date().toISOString(),
          type: 'vehicle_maintenance',
        });
      }

      if (vehicle.insuranceExpiration && vehicle.insuranceExpiration <= thirtyDaysFromNow) {
        const daysUntilDue = Math.ceil(
          (vehicle.insuranceExpiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        alerts.push({
          id: `vehicle-insurance-${vehicle.id}`,
          message: `Vehicle ${vehicle.unitNumber} insurance ${
            daysUntilDue <= 0 ? 'expired' : `expires in ${daysUntilDue} days`
          }`,
          severity: daysUntilDue <= 7 ? 'high' : 'medium',
          timestamp: new Date().toISOString(),
          type: 'vehicle_insurance',
        });
      }
    });

    // 2. Driver license expiration alerts
    const driverAlerts = await db.driver.findMany({
      where: {
        organizationId,
        status: 'active',
        OR: [
          {
            licenseExpiration: {
              lte: thirtyDaysFromNow,
            },
          },
          {
            medicalCardExpiration: {
              lte: thirtyDaysFromNow,
            },
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        licenseExpiration: true,
        medicalCardExpiration: true,
      },
    });

    driverAlerts.forEach((driver) => {
      if (driver.licenseExpiration && driver.licenseExpiration <= thirtyDaysFromNow) {
        const daysUntilDue = Math.ceil(
          (driver.licenseExpiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        alerts.push({
          id: `driver-license-${driver.id}`,
          message: `Driver ${driver.firstName} ${driver.lastName} license ${
            daysUntilDue <= 0 ? 'expired' : `expires in ${daysUntilDue} days`
          }`,
          severity: daysUntilDue <= 7 ? 'high' : 'medium',
          timestamp: new Date().toISOString(),
          type: 'driver_license',
        });
      }

      if (driver.medicalCardExpiration && driver.medicalCardExpiration <= thirtyDaysFromNow) {
        const daysUntilDue = Math.ceil(
          (driver.medicalCardExpiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        alerts.push({
          id: `driver-medical-${driver.id}`,
          message: `Driver ${driver.firstName} ${driver.lastName} medical card ${
            daysUntilDue <= 0 ? 'expired' : `expires in ${daysUntilDue} days`
          }`,
          severity: daysUntilDue <= 7 ? 'high' : 'medium',
          timestamp: new Date().toISOString(),
          type: 'driver_medical',
        });
      }
    });

    // 3. Load-related alerts (overdue, unassigned)
    const overdueLoads = await db.load.findMany({
      where: {
        organizationId,
        status: 'assigned',
        scheduledPickupDate: {
          lt: today,
        },
      },
      select: {
        id: true,
        loadNumber: true,
        customerName: true,
      },
      take: 5, // Limit to recent alerts
    });

    overdueLoads.forEach((load) => {
      alerts.push({
        id: `load-overdue-${load.id}`,
        message: `Load ${load.loadNumber} pickup is overdue (Customer: ${load.customerName})`,
        severity: 'high',
        timestamp: new Date().toISOString(),
        type: 'load_overdue',
      });
    });

    // Sort alerts by severity and timestamp
    const severityOrder: { [key: string]: number } = {
      high: 3,
      medium: 2,
      low: 1,
    };
    const sortedAlerts = alerts.sort((a, b) => {
      const aSeverity = severityOrder[a.severity] ?? 0;
      const bSeverity = severityOrder[b.severity] ?? 0;
      if (aSeverity !== bSeverity) {
        return bSeverity - aSeverity;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Ensure type safety for severity
    const typedAlerts: DashboardAlert[] = sortedAlerts.slice(0, 10).map((a) => ({
      ...a,
      severity:
        a.severity === 'high' || a.severity === 'medium' || a.severity === 'low'
          ? a.severity
          : 'low',
    }));

    return { success: true, data: typedAlerts }; // Return top 10 alerts
  } catch (error) {
    return handleError(error, 'Get Dashboard Alerts');
  }
}

export async function getTodaysScheduleAction(
  organizationId: string,
): Promise<DashboardActionResult<DashboardScheduleItem[]>> {
  if (!organizationId) {
    return { success: false, error: 'Organization ID is required.' };
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Get today's scheduled pickups
    const scheduledPickups = await db.load.count({
      where: {
        organizationId,
        scheduledPickupDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['assigned', 'pending'],
        },
      },
    });

    // Get today's scheduled deliveries
    const scheduledDeliveries = await db.load.count({
      where: {
        organizationId,
        scheduledDeliveryDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['in_transit', 'assigned'],
        },
      },
    });

    // Get vehicles scheduled for maintenance today
    const maintenanceScheduled = await db.vehicle.count({
      where: {
        organizationId,
        nextInspectionDue: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Get active loads in transit
    const loadsInTransit = await db.load.count({
      where: {
        organizationId,
        status: 'in_transit',
      },
    });

    const scheduleItems: DashboardScheduleItem[] = [];

    if (scheduledPickups > 0) {
      scheduleItems.push({
        id: 'pickups',
        description: `${scheduledPickups} load${
          scheduledPickups !== 1 ? 's' : ''
        } scheduled for pickup`,
        timePeriod: 'Today',
        count: scheduledPickups,
        type: 'pickup',
      });
    }

    if (scheduledDeliveries > 0) {
      scheduleItems.push({
        id: 'deliveries',
        description: `${scheduledDeliveries} load${
          scheduledDeliveries !== 1 ? 's' : ''
        } scheduled for delivery`,
        timePeriod: 'Today',
        count: scheduledDeliveries,
        type: 'delivery',
      });
    }

    if (maintenanceScheduled > 0) {
      scheduleItems.push({
        id: 'maintenance',
        description: `${maintenanceScheduled} vehicle${
          maintenanceScheduled !== 1 ? 's' : ''
        } scheduled for maintenance`,
        timePeriod: 'Today',
        count: maintenanceScheduled,
        type: 'maintenance',
      });
    }

    if (loadsInTransit > 0) {
      scheduleItems.push({
        id: 'in-transit',
        description: `${loadsInTransit} load${
          loadsInTransit !== 1 ? 's' : ''
        } currently in transit`,
        timePeriod: 'Active',
        count: loadsInTransit,
        type: 'in_transit',
      });
    }

    // If no scheduled items, provide a default message
    if (scheduleItems.length === 0) {
      scheduleItems.push({
        id: 'no-schedule',
        description: 'No scheduled activities for today',
        timePeriod: 'Today',
        count: 0,
        type: 'none',
      });
    }

    return { success: true, data: scheduleItems };
  } catch (error) {
    return handleError(error, "Get Today's Schedule");
  }
}

/**
 * Refresh dashboard data
 */
export async function refreshDashboardAction(): Promise<
  DashboardActionResult<{ message: string }>
> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Revalidate dashboard-related paths
    revalidatePath('/dashboard');
    revalidatePath('/');

    return { success: true, data: { message: 'Dashboard data refreshed' } };
  } catch (error) {
    return handleError(error, 'Refresh Dashboard');
  }
}

/**
 * Get dashboard performance metrics
 */
export async function getDashboardPerformanceAction(organizationId: string): Promise<
  DashboardActionResult<{
    onTimeDeliveryRate: number;
    fuelEfficiency: number;
    utilizationRate: number;
    customerSatisfaction: number;
  }>
> {
  if (!organizationId) {
    return { success: false, error: 'Organization ID is required.' };
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Calculate on-time delivery rate
    const totalDeliveries = await db.load.count({
      where: {
        organizationId,
        status: 'delivered',
        actualDeliveryDate: { gte: thirtyDaysAgo },
      },
    });

    const onTimeDeliveries = await db.load.count({
      where: {
        organizationId,
        status: 'delivered',
        actualDeliveryDate: {
          gte: thirtyDaysAgo,
          lte: db.load.fields.scheduledDeliveryDate,
        },
      },
    });

    const onTimeDeliveryRate = totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0;

    // Mock other metrics for MVP
    const performanceMetrics = {
      onTimeDeliveryRate: Math.round(onTimeDeliveryRate),
      fuelEfficiency: 85, // Mock: miles per gallon average
      utilizationRate: 78, // Mock: vehicle utilization percentage
      customerSatisfaction: 92, // Mock: customer satisfaction score
    };

    return { success: true, data: performanceMetrics };
  } catch (error) {
    return handleError(error, 'Get Dashboard Performance');
  }
}

/**
 * Mark alert as read
 */
export async function markAlertAsRead(orgId: string, alertId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const user = await db.user.findFirst({
    where: { id: userId, organizationId: orgId },
  });
  if (!user) throw new Error('User not found or unauthorized');

  // Check if alert belongs to organization
  const alert = await db.complianceAlert.findFirst({
    where: {
      id: alertId,
      organizationId: orgId,
    },
  });
  if (!alert) throw new Error('Alert not found');
  await db.complianceAlert.update({
    where: { id: alertId },
    data: {
      acknowledged: true,
      acknowledgedAt: new Date(),
    },
  });

  revalidatePath(`/${orgId}/dashboard`);
  return { success: true };
}

export async function refreshDashboardData(orgId: string, formData: FormData): Promise<void> {
  try {
    // Revalidate relevant paths
    revalidatePath(`/${orgId}/dashboard`);
    revalidatePath('/');
  } catch (error) {
    console.error('Error refreshing dashboard:', error);
  }
}

/**
 * Get system health status
 */
export async function getSystemHealthAction(): Promise<
  DashboardActionResult<{
    database: 'healthy' | 'unhealthy';
    uptime: number;
  }>
> {
  try {
    // Check database connectivity
    let dbStatus: 'healthy' | 'unhealthy' = 'healthy';
    try {
      await db.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unhealthy';
    }

    // Get process uptime in seconds
    const uptime = Math.floor(process.uptime());

    return {
      success: true,
      data: {
        database: dbStatus,
        uptime,
      },
    };
  } catch (error) {
    return handleError(error, 'Get System Health');
  }
}
