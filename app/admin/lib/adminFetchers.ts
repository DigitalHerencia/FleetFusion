'use server';

import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { adminListSchema, entityIdSchema } from '../schemas/admin.schema';

async function requireSuperAdmin() {
  await auth.assertRole('super-admin');
}

function idFrom(input: unknown): string {
  return entityIdSchema.parse(typeof input === 'string' ? { id: input } : input).id;
}

export async function getAllRoles(input: unknown = {}) {
  await requireSuperAdmin();
  const { search, page, pageSize } = adminListSchema.parse(input);
  const where: Prisma.RoleWhereInput = {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  return prisma.role.findMany({
    where,
    include: { permissions: true, organization: { select: { id: true, name: true, slug: true } } },
    orderBy: [{ organizationId: 'asc' }, { name: 'asc' }],
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

export async function getRoleById(input: unknown) {
  await requireSuperAdmin();
  const id = idFrom(input);
  return prisma.role.findFirst({
    where: { id, deletedAt: null },
    include: { permissions: true, organization: true },
  });
}

export async function getAllOrganizations(input: unknown = {}) {
  await requireSuperAdmin();
  const { search, page, pageSize } = adminListSchema.parse(input);
  return prisma.organization.findMany({
    where: {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { memberships: true, vehicles: true, drivers: true, loads: true } },
    },
    orderBy: { name: 'asc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

export async function getOrganizationById(input: unknown) {
  await requireSuperAdmin();
  const id = idFrom(input);
  return prisma.organization.findFirst({
    where: { id, deletedAt: null },
    include: {
      memberships: {
        where: { status: 'ACTIVE' },
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      },
      profiles: true,
      subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
}

export async function getSystemDocuments(input: unknown = {}) {
  await requireSuperAdmin();
  const { search, page, pageSize } = adminListSchema.parse(input);
  return prisma.systemDocument.findMany({
    where: {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { organization: { select: { id: true, name: true, slug: true } } },
    orderBy: [{ category: 'asc' }, { title: 'asc' }],
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

export async function getAdminDashboardSnapshot() {
  await requireSuperAdmin();
  const [organizations, activeOrganizations, roles, documents, pendingMemberships, database] =
    await Promise.all([
      prisma.organization.count({ where: { deletedAt: null } }),
      prisma.organization.count({ where: { deletedAt: null, isActive: true } }),
      prisma.role.count({ where: { deletedAt: null } }),
      prisma.systemDocument.count({ where: { deletedAt: null } }),
      prisma.organizationMembership.count({ where: { status: 'PENDING' } }),
      checkDatabase(),
    ]);
  return { organizations, activeOrganizations, roles, documents, pendingMemberships, database };
}

async function checkDatabase() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'online' as const, latencyMs: Date.now() - startedAt };
  } catch {
    return { status: 'unavailable' as const, latencyMs: null };
  }
}
