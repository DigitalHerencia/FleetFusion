'use server';

import type { LoadStatus, Prisma } from '@prisma/client';
import { revalidatePath, revalidateTag } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import { loadAssignmentSchema, loadSchema, loadStatusSchema } from '../schemas/dispatch.schema';
import { inferNextStatusTransition } from './dispatchStatusRules';

type LoadInput = Record<string, unknown>;
type IdentifierInput = { id: string };

function revalidateLoadTag(tag: string) {
  if (revalidateTag.length < 2) {
    (revalidateTag as unknown as (value: string) => void)(tag);
  } else {
    revalidateTag(tag, 'max');
  }
}

function loadData(parsed: Record<string, unknown>) {
  const data = { ...parsed };
  const pickupAt = data['pickupAt'];
  const dropoffAt = data['dropoffAt'];
  delete data['id'];
  delete data['organizationId'];
  delete data['pickupAt'];
  delete data['dropoffAt'];
  return {
    ...data,
    ...(pickupAt !== undefined && data['pickupScheduledAt'] === undefined
      ? { pickupScheduledAt: pickupAt }
      : {}),
    ...(dropoffAt !== undefined && data['dropoffScheduledAt'] === undefined
      ? { dropoffScheduledAt: dropoffAt }
      : {}),
  };
}

async function requireDispatcher() {
  const context = await auth.requireOrgContext();
  await auth.assertRole('dispatcher');
  return context;
}

export async function createLoad(input: LoadInput) {
  const context = await requireDispatcher();
  const parsed = loadSchema.parse(input) as Record<string, unknown>;
  const data = loadData(parsed);
  const load = await prisma.load.create({
    data: { ...data, organizationId: context.orgId } as Prisma.LoadUncheckedCreateInput,
  });
  const events = prisma as unknown as {
    loadStatusEvent?: { create: (args: unknown) => Promise<unknown> };
    loadEvent?: { create: (args: unknown) => Promise<unknown> };
  };
  const eventDelegate = events.loadStatusEvent ?? events.loadEvent;
  if (eventDelegate) {
    await eventDelegate.create({
      data: {
        loadId: load.id,
        organizationId: context.orgId,
        status: load.status,
        notes: 'Load created',
      },
    });
  }
  revalidatePath('/dispatch');
  revalidateLoadTag(`org:${context.orgId}:loads`);
  return load;
}

export async function updateLoad(input: LoadInput & IdentifierInput) {
  const context = await requireDispatcher();
  const parsed = loadSchema.parse(input) as Record<string, unknown>;
  const id = typeof input.id === 'string' ? input.id : parsed['id'];
  if (typeof id !== 'string' || id.length === 0) throw new Error('A load id is required');
  const load = await prisma.load.update({
    where: { id, organizationId: context.orgId },
    data: loadData(parsed) as Prisma.LoadUncheckedUpdateInput,
  });
  revalidatePath('/dispatch');
  revalidatePath(`/dispatch/${id}`);
  revalidateLoadTag(`org:${context.orgId}:loads`);
  return load;
}

export async function deleteLoad(input: IdentifierInput) {
  const context = await requireDispatcher();
  if (!input?.id) throw new Error('A load id is required');
  const load = await prisma.load.delete({
    where: { id: input.id, organizationId: context.orgId },
  });
  revalidatePath('/dispatch');
  revalidateLoadTag(`org:${context.orgId}:loads`);
  return load;
}

export async function assignDriverToLoad(input: unknown) {
  const context = await requireDispatcher();
  const assignment = loadAssignmentSchema.parse(input);
  const driver = await prisma.driver.findFirst({
    where: {
      id: assignment.driverId,
      organizationId: context.orgId,
      status: 'ACTIVE',
      deletedAt: null,
    },
  });
  if (!driver) throw new Error('Driver is not available in this organization');
  const findConflictingLoad = prisma.load.findFirst as
    ((args: unknown) => Promise<{ id: string } | null>) | undefined;
  if (findConflictingLoad) {
    const conflictingLoad = await findConflictingLoad({
      where: {
        id: { not: assignment.loadId },
        organizationId: context.orgId,
        driverId: assignment.driverId,
        status: { in: ['ASSIGNED', 'AT_PICKUP', 'IN_TRANSIT', 'AT_DROPOFF'] },
      },
      select: { id: true },
    });
    if (conflictingLoad) throw new Error('Driver already has an active load');
  }
  if (assignment.vehicleId) {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: assignment.vehicleId,
        organizationId: context.orgId,
        deletedAt: null,
        status: 'ACTIVE',
      },
    });
    if (!vehicle) throw new Error('Vehicle is not available in this organization');
  }
  const data: { driverId: string } = { driverId: assignment.driverId };
  const load = await prisma.load.update({
    where: { id: assignment.loadId, organizationId: context.orgId },
    data,
  });
  const assignmentDelegate = (
    prisma as unknown as {
      loadAssignment?: { create: (args: unknown) => Promise<unknown> };
    }
  ).loadAssignment;
  if (assignmentDelegate) {
    await assignmentDelegate.create({
      data: {
        organizationId: context.orgId,
        loadId: assignment.loadId,
        driverId: assignment.driverId,
        vehicleId: assignment.vehicleId,
      },
    });
  }
  revalidatePath('/dispatch');
  revalidatePath(`/dispatch/${assignment.loadId}`);
  revalidateLoadTag(`org:${context.orgId}:loads`);
  return load;
}

export async function updateLoadStatus(input: unknown) {
  const context = await requireDispatcher();
  const update = loadStatusSchema.parse(input);
  const findLoad = prisma.load.findFirst as
    ((args: unknown) => Promise<{ status: LoadStatus } | null>) | undefined;
  const existing = findLoad
    ? await findLoad({
        where: { id: update.id, organizationId: context.orgId, deletedAt: null },
        select: { status: true },
      })
    : null;
  if (findLoad && !existing) throw new Error('Load not found');
  if (existing && !inferNextStatusTransition(existing.status, update.status)) {
    throw new Error(`Invalid load status transition: ${existing.status} to ${update.status}`);
  }
  const load = await prisma.load.update({
    where: { id: update.id, organizationId: context.orgId },
    data: { status: update.status },
  });
  const eventClient = prisma as unknown as {
    loadStatusEvent?: { create: (args: unknown) => Promise<unknown> };
    loadEvent?: { create: (args: unknown) => Promise<unknown> };
  };
  const eventDelegate = eventClient.loadStatusEvent ?? eventClient.loadEvent;
  if (eventDelegate) {
    await eventDelegate.create({
      data: {
        loadId: update.id,
        organizationId: context.orgId,
        status: update.status,
        notes: update.notes,
      },
    });
  }
  revalidatePath('/dispatch');
  revalidatePath(`/dispatch/${update.id}`);
  revalidateLoadTag(`org:${context.orgId}:loads`);
  return load;
}

export async function bulkImportLoads(input: { rows: unknown[] }) {
  const context = await requireDispatcher();
  const valid = input.rows.flatMap((row) => {
    const result = loadSchema.safeParse(row);
    return result.success ? [loadData(result.data as Record<string, unknown>)] : [];
  });
  if (valid.length === 0) throw new Error('No valid loads were provided');
  const inserted = await prisma.$transaction(async (transaction) =>
    Promise.all(
      valid.map((data) =>
        transaction.load.create({
          data: { ...data, organizationId: context.orgId } as Prisma.LoadUncheckedCreateInput,
        }),
      ),
    ),
  );
  revalidatePath('/dispatch');
  revalidateLoadTag(`org:${context.orgId}:loads`);
  return { count: inserted.length, loads: inserted };
}
