import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { notificationFiltersSchema } from '../schemas/notifications.schema';

export async function getUserNotifications(input: unknown = {}) {
  const { orgId, userId } = await auth.requireOrgContext();
  const filters = notificationFiltersSchema.parse(input);
  return prisma.notification.findMany({
    where: {
      organizationId: orgId,
      OR: [{ userId }, { userId: null }],
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.channel ? { channel: filters.channel } : {}),
      ...(filters.unreadOnly ? { readAt: null, status: { not: 'READ' } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: filters.pageSize,
    skip: (filters.page - 1) * filters.pageSize,
  });
}

export async function getUnreadCount() {
  const { orgId, userId } = await auth.requireOrgContext();
  return prisma.notification.count({
    where: { organizationId: orgId, userId, readAt: null, status: { not: 'READ' } },
  });
}

export async function getNotificationById(input: { id: string }) {
  const { orgId, userId } = await auth.requireOrgContext();
  if (!input?.id) return null;
  return prisma.notification.findFirst({
    where: { id: input.id, organizationId: orgId, userId },
  });
}

export async function getNotificationPreferences() {
  const { userId } = await auth.requireOrgContext();
  const preferences = await prisma.notificationPreference.findUnique({ where: { userId } });
  return (
    preferences ?? {
      userId,
      emailEnabled: true,
      smsEnabled: false,
      inAppEnabled: true,
      categories: {},
    }
  );
}
