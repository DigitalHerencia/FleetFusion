'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import {
  dashboardNotificationSchema,
  dashboardSystemMessageSchema,
} from '../schemas/dashboard.schema';

export async function markAlertSeen(input: unknown) {
  const context = await auth.requireOrgContext();
  const { notificationId } = dashboardNotificationSchema.parse(input);
  const result = await prisma.notification.updateMany({
    where: {
      id: notificationId,
      organizationId: context.orgId,
      type: 'ALERT',
      OR: [{ userId: context.userId }, { userId: null }],
    },
    data: { readAt: new Date(), status: 'READ' },
  });
  revalidatePath('/dashboard');
  revalidateTag(`org:${context.orgId}:dashboard`, 'max');
  return result;
}

export async function clearNotificationBanner() {
  const context = await auth.requireOrgContext();
  const result = await prisma.notification.updateMany({
    where: {
      organizationId: context.orgId,
      userId: context.userId,
      readAt: null,
      channel: 'IN_APP',
    },
    data: { readAt: new Date(), status: 'READ' },
  });
  revalidatePath('/dashboard');
  revalidateTag(`org:${context.orgId}:dashboard`, 'max');
  return result;
}

export async function refreshDashboardCache() {
  const context = await auth.requireOrgContext();
  revalidatePath('/dashboard');
  revalidateTag(`org:${context.orgId}:dashboard`, 'max');
  return { refreshed: true };
}

export async function acknowledgeSystemMessage(input: unknown) {
  const context = await auth.requireOrgContext();
  const { messageId } = dashboardSystemMessageSchema.parse(input);
  const result = await prisma.notification.updateMany({
    where: {
      id: messageId,
      organizationId: context.orgId,
      type: 'SYSTEM',
      OR: [{ userId: context.userId }, { userId: null }],
    },
    data: { readAt: new Date(), status: 'READ' },
  });
  revalidatePath('/dashboard');
  revalidateTag(`org:${context.orgId}:dashboard`, 'max');
  return result;
}
