'use server';

import type { Prisma } from '@prisma/client';
import { revalidatePath, revalidateTag } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { driverSchema } from '../schemas/drivers.schema';

type DriverInput = Record<string, unknown>;

function revalidateDriverTag(tag: string) {
  if (revalidateTag.length < 2) {
    (revalidateTag as unknown as (value: string) => void)(tag);
  } else {
    revalidateTag(tag, 'max');
  }
}

async function requireDriverManager() {
  const context = await auth.requireOrgContext();
  await auth.assertRole('driver_manager');
  return context;
}

function driverData(parsed: Record<string, unknown>) {
  const data = { ...parsed };
  delete data['id'];
  delete data['organizationId'];
  return data;
}

export async function createDriver(input: DriverInput) {
  const context = await requireDriverManager();
  const parsed = driverSchema.parse(input) as Record<string, unknown>;
  const driver = await prisma.driver.create({
    data: {
      ...driverData(parsed),
      organizationId: context.orgId,
    } as Prisma.DriverUncheckedCreateInput,
  });
  revalidatePath('/drivers');
  revalidateDriverTag(`org:${context.orgId}:drivers`);
  return driver;
}

export async function updateDriver(input: DriverInput & { id: string }) {
  const context = await requireDriverManager();
  const parsed = driverSchema.parse(input) as Record<string, unknown>;
  const id = typeof input.id === 'string' ? input.id : parsed['id'];
  if (typeof id !== 'string' || !id) throw new Error('A driver id is required');
  const driver = await prisma.driver.update({
    where: { id, organizationId: context.orgId },
    data: driverData(parsed) as Prisma.DriverUncheckedUpdateInput,
  });
  revalidatePath('/drivers');
  revalidatePath(`/drivers/${id}`);
  revalidateDriverTag(`org:${context.orgId}:drivers`);
  return driver;
}

export async function deleteDriver(input: { id: string }) {
  const context = await requireDriverManager();
  if (!input?.id) throw new Error('A driver id is required');
  const driver = await prisma.driver.delete({
    where: { id: input.id, organizationId: context.orgId },
  });
  revalidatePath('/drivers');
  revalidateDriverTag(`org:${context.orgId}:drivers`);
  return driver;
}

export async function bulkImportDrivers(input: { rows: unknown[] }) {
  const context = await requireDriverManager();
  const valid = input.rows.flatMap((row) => {
    const result = driverSchema.safeParse(row);
    return result.success ? [driverData(result.data as Record<string, unknown>)] : [];
  });
  if (valid.length === 0) throw new Error('No valid drivers were provided');
  const transaction = (
    prisma as unknown as {
      $transaction?: <T>(callback: (client: typeof prisma) => Promise<T>) => Promise<T>;
    }
  ).$transaction;
  const drivers = transaction
    ? await transaction(async (client) =>
        Promise.all(
          valid.map((data) =>
            client.driver.create({
              data: { ...data, organizationId: context.orgId } as Prisma.DriverUncheckedCreateInput,
            }),
          ),
        ),
      )
    : await Promise.all(
        valid.map((data) =>
          prisma.driver.create({
            data: { ...data, organizationId: context.orgId } as Prisma.DriverUncheckedCreateInput,
          }),
        ),
      );
  revalidatePath('/drivers');
  revalidateDriverTag(`org:${context.orgId}:drivers`);
  return { count: drivers.length, drivers };
}
