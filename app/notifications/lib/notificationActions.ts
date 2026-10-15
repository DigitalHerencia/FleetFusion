'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import {
  notificationPreferenceSchema,
  sendSystemNotificationSchema,
} from '../schemas/notifications.schema';
import { queueNotificationDelivery } from './notificationsEngine';

export async function markNotificationRead(input: { id: string }) {
  const { orgId, userId } = await auth.requireOrgContext();
  if (!input?.id) throw new Error('A notification id is required.');
  const result = await prisma.notification.updateMany({
    where: { id: input.id, organizationId: orgId, userId, readAt: null },
    data: { readAt: new Date(), status: 'READ' },
  });
  revalidatePath('/notifications');
  return result.count > 0;
}

export async function markAllRead() {
  const { orgId, userId } = await auth.requireOrgContext();
  const result = await prisma.notification.updateMany({
    where: { organizationId: orgId, userId, readAt: null, status: { not: 'READ' } },
    data: { readAt: new Date(), status: 'READ' },
  });
  revalidatePath('/notifications');
  return result.count;
}

export async function sendSystemNotification(input: unknown) {
  const context = await auth.requireOrgContext();
  const notification = sendSystemNotificationSchema.parse(input);
  let recipientIds: string[];
  if (notification.userId) {
    if (notification.userId !== context.userId) await auth.assertRole('admin');
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId: context.orgId,
        userId: notification.userId,
        status: 'ACTIVE',
      },
      select: { userId: true },
    });
    if (!membership)
      throw new Error('The notification recipient is not an active organization member.');
    recipientIds = [notification.userId];
  } else {
    await auth.assertRole('admin');
    const memberships = await prisma.organizationMembership.findMany({
      where: { organizationId: context.orgId, status: 'ACTIVE' },
      select: { userId: true },
    });
    recipientIds = memberships.map(({ userId }) => userId);
  }

  const created = await Promise.all(
    recipientIds.map((userId) =>
      queueNotificationDelivery({
        organizationId: context.orgId,
        userId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        ...(notification.payload ? { payload: notification.payload } : {}),
        ...(notification.metadata ? { metadata: notification.metadata } : {}),
      }),
    ),
  );
  revalidatePath('/notifications');
  return created.flat();
}

export async function updateNotificationPreferences(input: unknown) {
  const { userId } = await auth.requireOrgContext();
  const preferences = notificationPreferenceSchema.parse(input);
  const saved = await prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, ...preferences, categories: preferences.categories },
    update: {
      emailEnabled: preferences.emailEnabled,
      smsEnabled: preferences.smsEnabled,
      inAppEnabled: preferences.inAppEnabled,
      categories: preferences.categories,
    },
  });
  revalidatePath('/notifications/preferences');
  return saved;
}
