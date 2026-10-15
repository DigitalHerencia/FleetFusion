'use server';

import type { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import {
  entityIdSchema,
  organizationSchema,
  roleSchema,
  systemDocumentSchema,
} from '../schemas/admin.schema';

function normalizeInput(input: unknown): unknown {
  if (!(input instanceof FormData)) return input;
  const result: Record<string, unknown> = Object.fromEntries(input.entries());
  if (typeof result['permissions'] === 'string') {
    result['permissions'] = result['permissions']
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }
  if (typeof result['organizationId'] === 'string' && !result['organizationId'].trim())
    result['organizationId'] = null;
  if (typeof result['ownerUserId'] === 'string' && !result['ownerUserId'].trim())
    delete result['ownerUserId'];
  for (const key of ['metadata', 'content']) {
    if (typeof result[key] === 'string' && result[key]) {
      try {
        result[key] = JSON.parse(result[key]);
      } catch {
        throw new Error(`${key} must contain valid JSON`);
      }
    }
  }
  if (result['isActive'] === 'on' || result['isActive'] === 'true') result['isActive'] = true;
  else if (result['isActive'] === 'false' || result['isActive'] === undefined)
    result['isActive'] = false;
  return result;
}

async function requireSuperAdmin() {
  await auth.assertRole('super-admin');
}

async function refreshAdminPages() {
  for (const path of ['/admin', '/admin/roles', '/admin/organizations', '/admin/documents']) {
    try {
      revalidatePath(path);
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') throw error;
    }
  }
}

function parseId(input: unknown): string {
  input = normalizeInput(input);
  if (typeof input === 'string') return entityIdSchema.parse({ id: input }).id;
  return entityIdSchema.parse(input).id;
}

export async function createRole(input: unknown) {
  await requireSuperAdmin();
  const parsed = roleSchema.omit({ id: true }).parse(normalizeInput(input));
  const { permissions, organizationId, description, ...fields } = parsed;
  const role = await prisma.role.create({
    data: {
      ...fields,
      ...(organizationId ? { organization: { connect: { id: organizationId } } } : {}),
      ...(description !== undefined ? { description } : {}),
      permissions: { create: permissions.map((permissionKey) => ({ permissionKey })) },
    },
    include: { permissions: true },
  });
  await refreshAdminPages();
  return role;
}

export async function updateRole(input: unknown) {
  await requireSuperAdmin();
  const parsed = roleSchema.extend({ id: entityIdSchema.shape.id }).parse(normalizeInput(input));
  const { id, permissions, name, organizationId, description } = parsed;
  const role = await prisma.$transaction(async (tx) => {
    const existing = await tx.role.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new Error('Role not found');
    await tx.role.update({
      where: { id },
      data: {
        name,
        ...(organizationId !== undefined
          ? organizationId
            ? { organization: { connect: { id: organizationId } } }
            : { organization: { disconnect: true } }
          : {}),
        ...(description !== undefined ? { description } : {}),
      },
    });
    await tx.rolePermission.deleteMany({ where: { roleId: id } });
    if (permissions.length) {
      await tx.rolePermission.createMany({
        data: permissions.map((permissionKey) => ({ roleId: id, permissionKey })),
      });
    }
    return tx.role.findUniqueOrThrow({ where: { id }, include: { permissions: true } });
  });
  await refreshAdminPages();
  return role;
}

export async function deleteRole(input: unknown) {
  await requireSuperAdmin();
  const id = parseId(input);
  await prisma.$transaction(async (tx) => {
    const role = await tx.role.findFirst({ where: { id, deletedAt: null } });
    if (!role) throw new Error('Role not found');
    await tx.role.update({ where: { id }, data: { deletedAt: new Date() } });
    await tx.rolePermission.deleteMany({ where: { roleId: id } });
  });
  await refreshAdminPages();
  return { id };
}

export async function createOrganization(input: unknown) {
  await requireSuperAdmin();
  const parsed = organizationSchema.omit({ id: true }).parse(normalizeInput(input));
  const { ownerUserId, metadata, ...fields } = parsed;
  const organization = await prisma.$transaction(async (tx) => {
    const created = await tx.organization.create({
      data: {
        ...fields,
        ...(metadata ? { metadata: metadata as Prisma.InputJsonValue } : {}),
      },
    });
    if (ownerUserId) {
      await tx.organizationMembership.create({
        data: { organizationId: created.id, userId: ownerUserId, role: 'OWNER', status: 'ACTIVE' },
      });
    }
    return created;
  });
  await refreshAdminPages();
  return organization;
}

export async function updateOrganization(input: unknown) {
  await requireSuperAdmin();
  const parsed = organizationSchema
    .extend({ id: entityIdSchema.shape.id })
    .parse(normalizeInput(input));
  const { id, name, slug, timezone, isActive, metadata } = parsed;
  const organization = await prisma.organization.update({
    where: { id, deletedAt: null },
    data: {
      name,
      slug,
      timezone,
      isActive,
      ...(metadata !== undefined ? { metadata: metadata as Prisma.InputJsonValue } : {}),
    },
  });
  await refreshAdminPages();
  return organization;
}

export async function deleteOrganization(input: unknown) {
  await requireSuperAdmin();
  const id = parseId(input);
  const updated = await prisma.organization.updateMany({
    where: { id, deletedAt: null },
    data: { isActive: false, deletedAt: new Date() },
  });
  if (!updated.count) throw new Error('Organization not found');
  await refreshAdminPages();
  return { id };
}

export async function createSystemDocument(input: unknown) {
  await requireSuperAdmin();
  const { content, title, slug, organizationId, category } = systemDocumentSchema
    .omit({ id: true })
    .parse(normalizeInput(input));
  const document = await prisma.systemDocument.create({
    data: {
      title,
      slug,
      content: content as Prisma.InputJsonValue,
      ...(organizationId ? { organization: { connect: { id: organizationId } } } : {}),
      ...(category !== undefined ? { category } : {}),
    },
  });
  await refreshAdminPages();
  return document;
}

export async function updateSystemDocument(input: unknown) {
  await requireSuperAdmin();
  const { id, content, ...fields } = systemDocumentSchema
    .extend({
      id: entityIdSchema.shape.id,
    })
    .parse(normalizeInput(input));
  const document = await prisma.systemDocument.update({
    where: { id, deletedAt: null },
    data: {
      title: fields.title,
      slug: fields.slug,
      content: content as Prisma.InputJsonValue,
      ...(fields.organizationId !== undefined
        ? fields.organizationId
          ? { organization: { connect: { id: fields.organizationId } } }
          : { organization: { disconnect: true } }
        : {}),
      ...(fields.category !== undefined ? { category: fields.category } : {}),
    },
  });
  await refreshAdminPages();
  return document;
}

export async function deleteSystemDocument(input: unknown) {
  await requireSuperAdmin();
  const id = parseId(input);
  const result = await prisma.systemDocument.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  if (!result.count) throw new Error('System document not found');
  await refreshAdminPages();
  return { id };
}

export async function refreshSystemIndexes() {
  await requireSuperAdmin();
  const startedAt = Date.now();
  await prisma.$executeRawUnsafe('ANALYZE');
  await refreshAdminPages();
  return { completedAt: new Date(), elapsedMs: Date.now() - startedAt };
}
