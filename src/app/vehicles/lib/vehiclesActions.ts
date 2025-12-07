'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { vehicleSchema } from '../schemas/vehicles.schema';

export async function createVehicle(input: unknown) {
  const { orgId } = await auth.requireOrgContext();
  await auth.assertRole('manager');

  const parsed = vehicleSchema.parse({ ...input, organizationId: orgId });

  const vehicle = await prisma.vehicle.create({ data: parsed });

  await revalidatePath('/vehicles');
  await revalidateTag(`org:${orgId}:vehicles`);

  return vehicle;
}

export async function updateVehicle(input: unknown) {
  const { orgId } = await auth.requireOrgContext();
  await auth.assertRole('manager');

  const parsed = vehicleSchema.partial({ id: true, organizationId: true }).parse(input);

  const { id, ...data } = parsed;
  if (!id) throw new Error('Vehicle id is required');

  const vehicle = await prisma.vehicle.update({
    where: { id, organizationId: orgId },
    data: { ...data, organizationId: orgId },
  });

  await revalidatePath('/vehicles');
  await revalidateTag(`org:${orgId}:vehicles`);

  return vehicle;
}

export async function deleteVehicle(input: { id: string }) {
  const { orgId } = await auth.requireOrgContext();
  await auth.assertRole('manager');

  const vehicle = await prisma.vehicle.update({
    where: { id: input.id, organizationId: orgId },
    data: { deletedAt: new Date() },
  });

  await revalidatePath('/vehicles');
  await revalidateTag(`org:${orgId}:vehicles`);

  return vehicle;
}

export async function bulkImportVehicles(input: { rows: unknown[] }) {
  const { orgId } = await auth.requireOrgContext();
  await auth.assertRole('manager');

  const created = await prisma.$transaction(
    input.rows.map((row) => {
      const parsed = vehicleSchema.parse({ ...row, organizationId: orgId });
      return prisma.vehicle.create({ data: parsed });
    }),
  );

  await revalidatePath('/vehicles');
  await revalidateTag(`org:${orgId}:vehicles`);

  return created;
}
