'use server';

import { requireAdminForOrg } from '@/lib/auth/utils';

import prisma from '@/lib/database/db';
import { CACHE_TTL, getCachedData, setCachedData } from '@/lib/cache/auth-cache';
import type {
  AuditLogEntry,
  BillingInfo,
  OrganizationStats,
  SystemHealth,
  UserManagementData,
} from '@/types/admin';

export async function getOrganizationStats(orgId: string): Promise<OrganizationStats> {
  await requireAdminForOrg(orgId);

  const cacheKey = `admin:stats:${orgId}`;
  const cached = getCachedData(cacheKey) as OrganizationStats | null;
  if (cached) return cached;

  const [userCount, activeUserCount, vehicleCount, driverCount, loadCount] = await Promise.all([
    prisma.user.count({ where: { organizationId: orgId } }),
    prisma.user.count({ where: { organizationId: orgId, isActive: true } }),
    prisma.vehicle.count({ where: { organizationId: orgId } }),
    prisma.user.count({ where: { organizationId: orgId, role: 'driver' } }),
    prisma.load.count({ where: { organizationId: orgId } }),
  ]);

  const stats: OrganizationStats = {
    userCount,
    activeUserCount,
    vehicleCount,
    driverCount,
    loadCount,
  };
  setCachedData(cacheKey, stats, CACHE_TTL.DATA);
  return stats;
}

export async function getOrganizationUsers(orgId: string): Promise<UserManagementData> {
  await requireAdminForOrg(orgId);
  const users = await prisma.user.findMany({
    where: { organizationId: orgId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
    },
    orderBy: { createdAt: 'desc' },
  });  return {
    users: users.map(u => ({
      id: u.id,
      email: u.email || '',
      name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
      role: u.role as string,
      isActive: u.isActive,
    })),
  };
}

export async function getAuditLogs(orgId: string): Promise<AuditLogEntry[]> {
  await requireAdminForOrg(orgId);
  
  // TODO: AuditLog model not yet implemented in schema
  // const logs = await prisma.auditLog.findMany({
  //   where: { organizationId: orgId },
  //   orderBy: { timestamp: 'desc' },
  // });
  // return logs.map(l => ({
  //   id: l.id,
  //   userId: l.userId || '',
  //   action: l.action,
  //   target: l.entityType + ':' + l.entityId,
  //   createdAt: l.timestamp.toISOString(),
  // }));
  
  return [];
}

export async function getBillingInfo(orgId: string): Promise<BillingInfo> {
  await requireAdminForOrg(orgId);
  
  // TODO: Subscription model not yet implemented in schema
  // const sub = await prisma.subscription.findFirst({ where: { organizationId: orgId } });
  // if (!sub) {
  //   return { plan: 'free', status: 'inactive', currentPeriodEnds: '' };
  // }
  // return {
  //   plan: sub.plan,
  //   status: sub.status,
  //   currentPeriodEnds: sub.currentPeriodEnds.toISOString(),
  // };

  // Return default billing info until subscription model is implemented
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { subscriptionTier: true, subscriptionStatus: true }
  });
  
  return {
    plan: org?.subscriptionTier || 'free',
    status: org?.subscriptionStatus || 'inactive',
    currentPeriodEnds: '',
  };
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const uptime = process.uptime();
  const databaseStatus = 'ok';
  const queueStatus = 'ok';
  return { uptime, databaseStatus, queueStatus };
}
