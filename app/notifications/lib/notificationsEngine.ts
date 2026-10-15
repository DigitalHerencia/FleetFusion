import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

import { notificationChannelSchema, notificationTypeSchema } from '../schemas/notifications.schema';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS';
export type NotificationType = 'SYSTEM' | 'ALERT' | 'REMINDER' | 'DIGEST';

export function classifyNotificationType(value: unknown): NotificationType {
  const parsed = notificationTypeSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  const text = String(value ?? '').toLowerCase();
  if (text.includes('expir') || text.includes('critical') || text.includes('alert')) return 'ALERT';
  if (text.includes('digest') || text.includes('summary')) return 'DIGEST';
  if (text.includes('remind') || text.includes('due')) return 'REMINDER';
  return 'SYSTEM';
}

export function computeRoutingTargets(
  type: NotificationType | string,
  preferences?: {
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    inAppEnabled?: boolean;
    categories?: unknown;
  } | null,
  rules?: Array<{ type?: string; channel?: string; config?: unknown }> | null,
): NotificationChannel[] {
  const categorySettings = preferences?.categories;
  if (
    categorySettings &&
    typeof categorySettings === 'object' &&
    (categorySettings as Record<string, unknown>)[type] === false
  ) {
    return [];
  }

  const matchingRules = rules?.filter((rule) => !rule.type || rule.type === type) ?? [];
  const requestedChannels = matchingRules.length
    ? matchingRules.map((rule) => rule.channel)
    : ['IN_APP', 'EMAIL', 'SMS'];
  const enabled = new Set<NotificationChannel>();
  for (const target of requestedChannels) {
    const result = notificationChannelSchema.safeParse(target);
    if (!result.success) continue;
    if (result.data === 'IN_APP' && preferences?.inAppEnabled === false) continue;
    if (result.data === 'EMAIL' && preferences?.emailEnabled === false) continue;
    if (result.data === 'SMS' && preferences?.smsEnabled !== true) continue;
    enabled.add(result.data);
  }
  return Array.from(enabled);
}

export function buildDigestPayload(
  notifications: Array<{
    id: string;
    title?: string;
    body?: string;
    createdAt?: Date | string;
  }>,
) {
  const ordered = [...notifications].sort(
    (left, right) =>
      new Date(left.createdAt ?? 0).getTime() - new Date(right.createdAt ?? 0).getTime(),
  );
  return {
    count: ordered.length,
    notificationIds: ordered.map(({ id }) => id),
    items: ordered.map(({ id, title, body, createdAt }) => ({
      id,
      title: title ?? '',
      body: body ?? '',
      createdAt: createdAt ?? null,
    })),
  };
}

export async function queueNotificationDelivery(input: {
  organizationId: string;
  userId?: string;
  type: NotificationType | string;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  channels?: NotificationChannel[];
}) {
  const type = classifyNotificationType(input.type);
  const preference = input.userId
    ? await prisma.notificationPreference.findUnique({ where: { userId: input.userId } })
    : null;
  const rules = await prisma.notificationRoutingRule.findMany({
    where: { organizationId: input.organizationId, type },
  });
  const channels = input.channels ?? computeRoutingTargets(type, preference, rules);
  if (!channels.length) return [];

  const rows = channels.map((channel) => ({
    organizationId: input.organizationId,
    ...(input.userId ? { userId: input.userId } : {}),
    type,
    channel,
    title: input.title,
    body: input.body,
    ...(input.payload ? { payload: input.payload } : {}),
    metadata: {
      ...input.metadata,
      queuedAt: new Date().toISOString(),
    },
  }));
  return prisma.$transaction((transaction) =>
    Promise.all(
      rows.map((data) =>
        transaction.notification.create({
          data: data as Prisma.NotificationUncheckedCreateInput,
        }),
      ),
    ),
  );
}
