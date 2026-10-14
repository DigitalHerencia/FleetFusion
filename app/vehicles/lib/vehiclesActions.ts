'use server';

import { Prisma, type PrismaClient } from '@prisma/client';
import { revalidatePath, revalidateTag } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { vehicleSchema } from '../schemas/vehicles.schema';

type VehicleClient = Pick<PrismaClient, 'vehicle'>;

async function revalidateVehicles(orgId: string) {
  try {
    await revalidatePath('/vehicles');
    await revalidateTag(`org:${orgId}:vehicles`);
  } catch (error) {
    if (process.env.NODE_ENV === 'test') return;
    throw error;
  }
}

function toInsensitiveEquals(value?: string | null): Prisma.StringFilter | undefined {
  if (!value) return undefined;
  return { equals: value, mode: 'insensitive' };
}

function handleNotFound(error: unknown, message: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    throw new Error(message);
  }
  throw error;
}

async function ensureVehicleUnique(
  client: VehicleClient,
  orgId: string,
  data: { vin?: string | null; name?: string | null; excludeId?: string },
) {
  const or: Prisma.VehicleWhereInput[] = [];
  if (data.vin) or.push({ vin: toInsensitiveEquals(data.vin) });
  if (data.name) or.push({ name: toInsensitiveEquals(data.name) });

  if (!or.length) return;

  const existing = await client.vehicle.findFirst({
    where: {
      organizationId: orgId,
      NOT: data.excludeId ? { id: data.excludeId } : undefined,
      OR: or,
    },
  });

  if (existing) {
    throw new Error('A vehicle with this VIN or name already exists');
  }
}

export async function createVehicle(input: unknown) {
  const { orgId } = await auth.requireOrgContext();
  await auth.assertRole('manager');

  const parsed = vehicleSchema.parse({ ...input, organizationId: orgId });

  await ensureVehicleUnique(prisma, orgId, { vin: parsed.vin, name: parsed.name });

  const vehicle = await prisma.vehicle.create({ data: parsed }).catch((error) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('A vehicle with this VIN already exists');
    }
    throw error;
  });

  await revalidateVehicles(orgId);

  return vehicle;
}

export async function updateVehicle(input: unknown) {
  const { orgId } = await auth.requireOrgContext();
  await auth.assertRole('manager');

  const updateSchema = vehicleSchema.partial().extend({
    id: vehicleSchema.shape.id,
    organizationId: vehicleSchema.shape.organizationId.optional(),
  });

  const parsed = updateSchema.parse({ ...input, organizationId: orgId });

  const { id, ...data } = parsed;
  if (!id) throw new Error('Vehicle id is required');

  await ensureVehicleUnique(prisma, orgId, { vin: data.vin, name: data.name, excludeId: id });

  const vehicle = await prisma.vehicle
    .update({
      where: { id, organizationId: orgId, deletedAt: null },
      data: { ...data, organizationId: orgId },
    })
    .catch((error) => handleNotFound(error, 'Vehicle not found or already deleted'));

  await revalidateVehicles(orgId);

  return vehicle;
}

export async function deleteVehicle(input: { id: string }) {
  const { orgId } = await auth.requireOrgContext();
  await auth.assertRole('manager');

  const existing = await prisma.vehicle.findFirst({
    where: { id: input.id, organizationId: orgId },
  });
  if (!existing) {
    throw new Error('Vehicle not found');
  }

  const updated = await prisma.vehicle.updateMany({
    where: { id: input.id, organizationId: orgId },
    data: { deletedAt: existing.deletedAt ?? new Date() },
  });

  if (updated.count === 0) {
    throw new Error('Vehicle not found');
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: input.id } });

  await revalidateVehicles(orgId);

  return vehicle;
}

export async function bulkImportVehicles(input: { rows: unknown[] }) {
  const { orgId } = await auth.requireOrgContext();
  await auth.assertRole('manager');

  if (!Array.isArray(input.rows) || input.rows.length === 0) {
    return [] as const;
  }

  const parsedRows = input.rows.map((row) =>
    vehicleSchema.parse({ ...row, organizationId: orgId }),
  );

  const seenVins = new Set<string>();
  const seenNames = new Set<string>();
  parsedRows.forEach((row, index) => {
    if (row.vin) {
      const normalizedVin = row.vin.toUpperCase();
      if (seenVins.has(normalizedVin)) {
        throw new Error(`Duplicate VIN in import payload at row ${index + 1}`);
      }
      seenVins.add(normalizedVin);
    }
    if (row.name) {
      const normalizedName = row.name.toUpperCase();
      if (seenNames.has(normalizedName)) {
        throw new Error(`Duplicate name in import payload at row ${index + 1}`);
      }
      seenNames.add(normalizedName);
    }
  });

  const created = await prisma
    .$transaction(async (tx) => {
      for (const row of parsedRows) {
        await ensureVehicleUnique(tx, orgId, { vin: row.vin, name: row.name });
      }

      return Promise.all(parsedRows.map((row) => tx.vehicle.create({ data: row })));
    })
    .catch((error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('A vehicle with this VIN already exists');
      }
      throw error;
    });

  await revalidateVehicles(orgId);

  return created;
}
