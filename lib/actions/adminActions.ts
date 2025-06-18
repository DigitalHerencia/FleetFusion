"use server";

// NOTE: All ABAC/auth types (UserRole, Permission, ResourceType, etc.)
// are now defined in types/auth.ts or types/abac.ts. Do not define or export them here.
//
// IMPORTANT: If you need UserRole, Permission, ResourceType, etc., import them from '@/types/auth' or '@/types/abac'.

import { auth, clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/database/db';
import { handleError } from '@/lib/errors/handleError';
import { SystemRoles } from '@/types/abac';
import type { AdminActionResult } from '@/types/actions';
import type { DatabaseUser } from '@/types/auth';
import type { AuditLogEntry, OrganizationStats } from '@/types/admin';

async function verifyAdminAccess(userId: string, orgId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { organizationId: true, role: true },
  });
  return (
    user?.organizationId === orgId && user.role === SystemRoles.ADMIN
  );
}

/**
 * Get all users in an organization (Admin only)
 */
type OrgUser = {
  id: string;
  clerkId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date | null;
};

export async function getOrganizationUsersAction(
  orgId: string
): Promise<AdminActionResult<OrgUser[]>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get users from database with their roles
    const users = await prisma.user.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: users };
  } catch (error) {
    return handleError(error, 'Get Organization Users');
  }
}

/**
 * Update user role (Admin only)
 */
export async function updateUserRoleAction(
  orgId: string,
  targetUserId: string,
  newRole: string
): Promise<AdminActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate role
    if (!Object.values(SystemRoles).includes(newRole as any)) {
      return { success: false, error: 'Invalid role' };
    }

    // Update in Clerk
    const client = await clerkClient();
    await client.users.updateUser(targetUserId, {
      publicMetadata: { role: newRole },
    });

    revalidatePath(`/dashboard/${orgId}/admin`);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Update User Role');
  }
}

/**
 * Deactivate user (Admin only)
 */
export async function deactivateUserAction(
  orgId: string,
  targetUserId: string
): Promise<AdminActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update in database
    await prisma.user.update({
      where: {
        id: targetUserId,
        organizationId: orgId,
      },
      data: { isActive: false },
    });

    revalidatePath(`/dashboard/${orgId}/admin`);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Deactivate User');
  }
}

/**
 * Get system audit logs (Admin only)
 */
export async function getAuditLogsAction(
  orgId: string
): Promise<AdminActionResult<AuditLogEntry[]>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get audit logs for the organization
    const auditLogs = await prisma.auditLog.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Transform to match AuditLogEntry interface
    const transformedLogs: AuditLogEntry[] = auditLogs.map(log => ({
      id: log.id,
      userId: log.userId || '',
      action: log.action,
      target: log.entityType,
      createdAt: log.timestamp.toISOString(),
    }));

    return { success: true, data: transformedLogs };
  } catch (error) {
    return handleError(error, 'Get Audit Logs');
  }
}

/**
 * Get organization statistics (Admin only)
 */
export async function getOrganizationStatsAction(
  orgId: string
): Promise<AdminActionResult<OrganizationStats>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get various counts and statistics
    const [userCount, activeUserCount, vehicleCount, driverCount, loadCount] =
      await Promise.all([
        prisma.user.count({ where: { organizationId: orgId } }),
        prisma.user.count({ where: { organizationId: orgId, isActive: true } }),
        prisma.vehicle.count({ where: { organizationId: orgId } }),
        prisma.user.count({
          where: { organizationId: orgId, role: SystemRoles.DRIVER },
        }),
        prisma.load.count({ where: { organizationId: orgId } }),
      ]);

    const stats = {
      userCount,
      activeUserCount,
      vehicleCount,
      driverCount,
      loadCount,
    };

    return { success: true, data: stats };
  } catch (error) {
    return handleError(error, 'Get Organization Stats');
  }
}

/**
 * Bulk invite users (placeholder implementation)
 */
export async function inviteUsersAction(
  orgId: string,
  formData: FormData
): Promise<AdminActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get emails and role from form data
    const emailsString = formData.get('emails') as string;
    const role = formData.get('role') as string;
    
    if (!emailsString || !role) {
      return { success: false, error: 'Missing required fields' };
    }

    const emails = emailsString.split(',').map(email => email.trim()).filter(email => email);
    
    if (emails.length === 0) {
      return { success: false, error: 'No valid emails provided' };
    }

    // Validate role
    if (!Object.values(SystemRoles).includes(role as any)) {
      return { success: false, error: 'Invalid role' };
    }

    // Implementation would send invitations via Clerk
    // For now, log count in development only
    if (process.env.NODE_ENV === 'development') {
      console.log('Inviting users', { count: emails.length, orgId });
    }
    
    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId,
        organizationId: orgId,
        action: 'BULK_INVITE_USERS',
        entityType: 'USER',
        entityId: '',
        metadata: { emails, role, count: emails.length },
        timestamp: new Date(),
      },
    });

    revalidatePath(`/${orgId}/admin`);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Invite Users');
  }
}

/**
 * Bulk activate users
 */
export async function activateUsersAction(
  orgId: string,
  formData: FormData
): Promise<AdminActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const userIdsString = formData.get('userIds') as string;
    const userIds = userIdsString ? userIdsString.split(',').filter(id => id.trim()) : [];

    if (userIds.length === 0) {
      // Activate all users if no specific IDs provided
      await prisma.user.updateMany({
        where: { organizationId: orgId, isActive: false },
        data: { isActive: true },
      });
    } else {
      // Activate specific users
      await prisma.user.updateMany({
        where: { 
          organizationId: orgId, 
          id: { in: userIds },
          isActive: false 
        },
        data: { isActive: true },
      });
    }

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId,
        organizationId: orgId,
        action: 'BULK_ACTIVATE_USERS',
        entityType: 'USER',
        entityId: '',
        metadata: { userIds, count: userIds.length || 'all' },
        timestamp: new Date(),
      },
    });

    revalidatePath(`/${orgId}/admin`);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Activate Users');
  }
}

/**
 * Bulk deactivate users
 */
export async function deactivateUsersAction(
  orgId: string,
  formData: FormData
): Promise<AdminActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const userIdsString = formData.get('userIds') as string;
    const userIds = userIdsString ? userIdsString.split(',').filter(id => id.trim()) : [];

    if (userIds.length === 0) {
      return { success: false, error: 'No users specified for deactivation' };
    }

    // Deactivate specific users (don't allow bulk deactivation of all users)
    await prisma.user.updateMany({
      where: { 
        organizationId: orgId, 
        id: { in: userIds },
        isActive: true 
      },
      data: { isActive: false },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId,
        organizationId: orgId,
        action: 'BULK_DEACTIVATE_USERS',
        entityType: 'USER',
        entityId: '',
        metadata: { userIds, count: userIds.length },
        timestamp: new Date(),
      },
    });

    revalidatePath(`/${orgId}/admin`);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Deactivate Users');
  }
}

/**
 * Export organization data
 */
export async function exportOrganizationDataAction(
  orgId: string,
  formData: FormData
): Promise<AdminActionResult<{ downloadUrl: string }>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const exportType = formData.get('exportType') as string || 'full';
    const format = formData.get('format') as string || 'csv';

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId,
        organizationId: orgId,
        action: 'EXPORT_DATA',
        entityType: 'ORGANIZATION',
        entityId: orgId,
        metadata: { exportType, format },
        timestamp: new Date(),
      },
    });

    // TODO: Implement actual data export logic
    // This would generate a file and return a download URL
    const downloadUrl = `/api/admin/export/${orgId}?type=${exportType}&format=${format}`;

    return { success: true, data: { downloadUrl } };
  } catch (error) {
    return handleError(error, 'Export Organization Data');
  }
}

/**
 * Get system health metrics
 */
export async function getSystemHealthAction(): Promise<AdminActionResult<{
  uptime: number;
  databaseStatus: string;
  queueStatus: string;
  memoryUsage: number;
  cpuUsage: number;
}>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Basic system health metrics
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    const healthData = {
      uptime,
      databaseStatus: 'healthy',
      queueStatus: 'healthy', 
      memoryUsage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
      cpuUsage: 0, // Would need additional monitoring for real CPU usage
    };

    return { success: true, data: healthData };
  } catch (error) {
    return handleError(error, 'Get System Health');
  }
}

/**
 * Update organization settings
 */
export async function updateOrganizationSettingsAction(
  orgId: string,
  formData: FormData
): Promise<AdminActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const timezone = formData.get('timezone') as string;
    const features = formData.get('features') as string;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (timezone) updateData.timezone = timezone;
    if (features) {
      try {
        updateData.features = JSON.parse(features);
      } catch (e) {
        return { success: false, error: 'Invalid features JSON' };
      }
    }

    await prisma.organization.update({
      where: { id: orgId },
      data: updateData,
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId,
        organizationId: orgId,
        action: 'UPDATE_ORGANIZATION_SETTINGS',
        entityType: 'ORGANIZATION',
        entityId: orgId,
        metadata: updateData,
        timestamp: new Date(),
      },
    });

    revalidatePath(`/${orgId}/admin`);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Update Organization Settings');
  }
}

/**
 * Get organization billing info
 */
export async function getOrganizationBillingAction(
  orgId: string
): Promise<AdminActionResult<{
  plan: string;
  status: string;
  currentPeriodEnds: string;
  usage: {
    users: number;
    maxUsers: number;
    vehicles: number;
    maxVehicles: number;
  };
}>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { 
        subscriptionTier: true, 
        subscriptionStatus: true,
        maxUsers: true,
        maxVehicles: true,
      }
    });

    if (!org) {
      return { success: false, error: 'Organization not found' };
    }

    const [userCount, vehicleCount] = await Promise.all([
      prisma.user.count({ where: { organizationId: orgId } }),
      prisma.vehicle.count({ where: { organizationId: orgId } }),
    ]);

    const billingData = {
      plan: org.subscriptionTier || 'free',
      status: org.subscriptionStatus || 'active',
      currentPeriodEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      usage: {
        users: userCount,
        maxUsers: org.maxUsers || 5,
        vehicles: vehicleCount,
        maxVehicles: org.maxVehicles || 10,
      },
    };

    return { success: true, data: billingData };
  } catch (error) {
    return handleError(error, 'Get Organization Billing');
  }
}
