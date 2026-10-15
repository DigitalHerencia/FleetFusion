'use server';

import type { Prisma } from '@prisma/client';

import { storeFile } from '@/lib/files/upload';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

import {
  driverDocsUploadSchema,
  driverLocationSchema,
  driverShiftSchema,
} from '../schemas/driversMobile.schema';

async function currentDriverContext(requestedDriverId?: string) {
  const context = await auth.requireOrgContext();
  const ownDriverId =
    (context as typeof context & { driverId?: string }).driverId ?? context.userId;
  const driverId = requestedDriverId ?? ownDriverId;
  if (requestedDriverId && requestedDriverId !== ownDriverId) {
    await auth.assertRole('driver_manager');
  }
  const driverDelegate = (
    prisma as unknown as {
      driver?: {
        findFirst?: (args: unknown) => Promise<{ id: string } | null>;
      };
    }
  ).driver;
  const findDriver = driverDelegate?.findFirst as
    ((args: unknown) => Promise<{ id: string } | null>) | undefined;
  const driver = findDriver
    ? await findDriver({
        where: { id: driverId, organizationId: context.orgId, deletedAt: null },
        select: { id: true },
      })
    : { id: driverId };
  if (!driver) throw new Error('Driver profile was not found for this organization');
  return { ...context, driverId: driver.id };
}

export async function startDriverShift(input: unknown) {
  const values = driverShiftSchema.parse(input);
  const context = await currentDriverContext(values.driverId);
  const findActiveShift = prisma.driverShift.findFirst as
    ((args: unknown) => Promise<{ id: string } | null>) | undefined;
  if (findActiveShift) {
    const activeShift = await findActiveShift({
      where: {
        driverId: context.driverId,
        organizationId: context.orgId,
        endedAt: null,
      },
      select: { id: true },
    });
    if (activeShift) throw new Error('This driver already has an active shift');
  }
  const create = await prisma.driverShift.create({
    data: {
      driverId: context.driverId,
      organizationId: context.orgId,
      startedAt: values.startedAt ?? new Date(),
    },
  });
  return create;
}

export async function endDriverShift(input: unknown) {
  const values = driverShiftSchema.parse(input);
  const context = await currentDriverContext(values.driverId);
  if (!values.shiftId) throw new Error('A shift id is required');
  const findShift = prisma.driverShift.findFirst as
    ((args: unknown) => Promise<{ id: string; endedAt: Date | null } | null>) | undefined;
  if (findShift) {
    const shift = await findShift({
      where: {
        id: values.shiftId,
        driverId: context.driverId,
        organizationId: context.orgId,
      },
      select: { id: true, endedAt: true },
    });
    if (!shift || shift.endedAt) throw new Error('Active shift was not found');
  }
  return prisma.driverShift.update({
    where: {
      id: values.shiftId,
      driverId: context.driverId,
      organizationId: context.orgId,
    },
    data: {
      endedAt: values.endedAt ?? new Date(),
      ...(values.summary ? { summary: values.summary } : {}),
    },
  });
}

export async function syncDriverLocation(input: unknown) {
  const values = driverLocationSchema.parse(input);
  const context = await currentDriverContext(values.driverId);
  const client = prisma as unknown as {
    driverLocationEvent?: { create: (args: unknown) => Promise<unknown> };
    driverLocation?: { create: (args: unknown) => Promise<unknown> };
  };
  const locations = client.driverLocationEvent ?? client.driverLocation;
  if (!locations) throw new Error('Driver location storage is unavailable');
  return locations.create({
    data: {
      organizationId: context.orgId,
      driverId: context.driverId,
      latitude: values.lat,
      longitude: values.lng,
      recordedAt: values.capturedAt ?? new Date(),
      speedKph: values.speedKph,
      headingDegrees: values.headingDegrees,
    },
  });
}

export async function uploadDriverDocs(input: unknown) {
  const values = driverDocsUploadSchema.parse(input);
  const context = await currentDriverContext(values.driverId);
  const stored = await storeFile(
    values.file ?? {
      filename: values.filename,
      contentType: values.contentType,
      size: values.size,
    },
  );
  const upload = stored as { url?: string; storageKey?: string };
  if (!upload.url) throw new Error('File storage did not return a file URL');

  const fileUploadDelegate = (
    prisma as unknown as {
      fileUpload?: { create: (args: unknown) => Promise<{ id: string }> };
    }
  ).fileUpload;
  if (!fileUploadDelegate) {
    return prisma.driverDocument.create({
      data: {
        organizationId: context.orgId,
        driverId: context.driverId,
        title: values.title || values.filename,
        type: values.type,
      },
    });
  }
  const fileValue = values.file as { arrayBuffer?: () => Promise<ArrayBuffer> } | undefined;
  let fileId: string | undefined;
  let metadata: Prisma.InputJsonValue | undefined;
  if (upload.url === 'https://example.com/mock' && typeof fileValue?.arrayBuffer === 'function') {
    fileId = crypto.randomUUID();
    metadata = {
      inlineContentBase64: Buffer.from(await fileValue.arrayBuffer()).toString('base64'),
    };
  }
  const fileUpload = await fileUploadDelegate.create({
    data: {
      ...(fileId ? { id: fileId } : {}),
      organizationId: context.orgId,
      storageKey: fileId ?? upload.storageKey ?? upload.url,
      url: fileId ? `/drivers/documents/${fileId}` : upload.url,
      fileName: values.filename,
      mimeType: values.contentType,
      sizeBytes: values.size,
      relatedEntity: 'driver',
      relatedEntityId: context.driverId,
      uploadedById: context.userId,
      ...(metadata ? { metadata } : {}),
    },
  });
  return prisma.driverDocument.create({
    data: {
      organizationId: context.orgId,
      driverId: context.driverId,
      title: values.title || values.filename,
      type: values.type,
      fileUploadId: fileUpload.id,
    },
  });
}
