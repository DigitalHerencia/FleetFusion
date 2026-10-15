import { createHash } from 'node:crypto';

import { verifyWebhook } from '@clerk/nextjs/webhooks';
import type { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

type ClerkWebhookData = {
  id?: string;
  email?: string | null;
  email_addresses?: Array<{ id: string; email_address: string }>;
  primary_email_address_id?: string;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  slug?: string | null;
  name?: string | null;
  role?: string;
  organization?: { id?: string };
  organization_id?: string;
  public_user_data?: { user_id?: string };
  user_id?: string;
  user?: { id?: string };
};
type WebhookTransaction = Prisma.TransactionClient;

function clerkEmail(data: ClerkWebhookData): string | null {
  const addresses = Array.isArray(data.email_addresses) ? data.email_addresses : [];
  const primary = addresses.find(
    (address) => address.id === data.primary_email_address_id,
  );
  return primary?.email_address ?? addresses[0]?.email_address ?? data.email ?? null;
}

function membershipRole(value: unknown) {
  const role = String(value ?? '').toLowerCase();
  if (role.includes('admin') || role.includes('owner')) return 'ADMIN' as const;
  if (role.includes('manager')) return 'MANAGER' as const;
  if (role.includes('dispatcher')) return 'DISPATCHER' as const;
  return 'MEMBER' as const;
}

async function persistUser(
  transaction: WebhookTransaction,
  data: ClerkWebhookData,
  deleted = false,
) {
  if (typeof data.id !== 'string' || !data.id) return;
  const profile = {
    email: clerkEmail(data),
    firstName: data.first_name ?? null,
    lastName: data.last_name ?? null,
    avatarUrl: data.image_url ?? null,
    status: deleted ? 'SUSPENDED' : 'ACTIVE',
  };
  if (deleted) {
    await transaction.user.updateMany({
      where: { externalId: data.id },
      data: { status: 'SUSPENDED' },
    });
    return;
  }
  await transaction.user.upsert({
    where: { externalId: data.id },
    create: { externalId: data.id, ...profile },
    update: profile,
  });
}

async function persistOrganization(
  transaction: WebhookTransaction,
  data: ClerkWebhookData,
  deleted = false,
) {
  if (typeof data.id !== 'string' || !data.id) return;
  if (deleted) {
    await transaction.organization.updateMany({
      where: { id: data.id },
      data: { isActive: false, deletedAt: new Date() },
    });
    return;
  }
  const slug = String(data.slug || data.id).toLowerCase();
  const name = String(data.name || data.slug || data.id);
  await transaction.organization.upsert({
    where: { id: data.id },
    create: { id: data.id, slug, name, isActive: true },
    update: { slug, name, isActive: true, deletedAt: null },
  });
}

async function persistMembership(
  transaction: WebhookTransaction,
  data: ClerkWebhookData,
  revoked = false,
) {
  const organizationId = data.organization?.id ?? data.organization_id;
  const externalUserId = data.public_user_data?.user_id ?? data.user_id ?? data.user?.id;
  if (typeof organizationId !== 'string' || typeof externalUserId !== 'string') return;

  const [organization, user] = await Promise.all([
    transaction.organization.findUnique({ where: { id: organizationId }, select: { id: true } }),
    transaction.user.findUnique({
      where: { externalId: externalUserId },
      select: { id: true },
    }),
  ]);
  if (!organization || !user) return;

  const key = { organizationId_userId: { organizationId, userId: user.id } };
  if (revoked) {
    await transaction.organizationMembership.updateMany({
      where: { organizationId, userId: user.id },
      data: { status: 'REVOKED' },
    });
    return;
  }
  await transaction.organizationMembership.upsert({
    where: key,
    create: {
      organizationId,
      userId: user.id,
      role: membershipRole(data.role),
      status: 'ACTIVE',
    },
    update: { role: membershipRole(data.role), status: 'ACTIVE' },
  });
}

async function applyEvent(
  transaction: WebhookTransaction,
  type: string,
  data: ClerkWebhookData,
) {
  switch (type) {
    case 'user.created':
    case 'user.updated':
      await persistUser(transaction, data);
      return true;
    case 'user.deleted':
      await persistUser(transaction, data, true);
      return true;
    case 'organization.created':
    case 'organization.updated':
      await persistOrganization(transaction, data);
      return true;
    case 'organization.deleted':
      await persistOrganization(transaction, data, true);
      return true;
    case 'organizationMembership.created':
    case 'organizationMembership.updated':
      await persistMembership(transaction, data);
      return true;
    case 'organizationMembership.deleted':
      await persistMembership(transaction, data, true);
      return true;
    default:
      return false;
  }
}

export async function POST(request: Request) {
  const rawBody = await request.clone().text();
  let event: { type: string; data: ClerkWebhookData };
  try {
    event = (await verifyWebhook(
      request as unknown as Parameters<typeof verifyWebhook>[0],
    )) as typeof event;
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
  }

  const eventId = request.headers.get('svix-id');
  if (!eventId) {
    return NextResponse.json({ error: 'Missing webhook event id.' }, { status: 400 });
  }
  const requestHash = createHash('sha256').update(rawBody).digest('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  try {
    const outcome = await prisma.$transaction(async (transaction) => {
      const existing = await transaction.idempotencyToken.findUnique({
        where: { token: eventId },
      });
      if (existing) {
        if (existing.requestHash !== requestHash) throw new Error('Webhook event id collision.');
        return { duplicate: true, processed: false };
      }

      const processed = await applyEvent(transaction, event.type, event.data ?? {});
      await transaction.idempotencyToken.create({
        data: { token: eventId, requestHash, usedAt: new Date(), expiresAt },
      });
      return { duplicate: false, processed };
    });

    return NextResponse.json({ received: true, ...outcome });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      const existing = await prisma.idempotencyToken.findUnique({
        where: { token: eventId },
      });
      if (existing?.requestHash === requestHash) {
        return NextResponse.json({ received: true, duplicate: true, processed: false });
      }
      if (existing) {
        return NextResponse.json({ error: 'Webhook event id collision.' }, { status: 409 });
      }
    }
    if (error instanceof Error && error.message === 'Webhook event id collision.') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('Clerk webhook persistence failed.', error);
    return NextResponse.json({ error: 'Webhook persistence failed.' }, { status: 500 });
  }
}
