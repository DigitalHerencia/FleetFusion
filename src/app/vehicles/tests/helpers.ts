import { prisma } from '@/lib/prisma';
import { type OrgContext } from '@/lib/server/auth';

declare global {
  // Used by tests to supply org/user context without hitting Clerk.
  var __TEST_AUTH_CONTEXT__: OrgContext | undefined;
}

export const VEHICLES_TEST_ORG_ID = 'org_vehicles_test';
export const VEHICLES_TEST_USER_ID = 'user_vehicles_manager';

export function ensureDatabase() {
  if (!process.env['DATABASE_URL']) {
    throw new Error('DATABASE_URL must be set for integration tests');
  }
}

// Option A: bypass RBAC in tests by granting wildcard permissions.
export function setTestAuthContext(
  role: string = 'manager',
  orgId: string = VEHICLES_TEST_ORG_ID,
  userId: string = VEHICLES_TEST_USER_ID,
) {
  globalThis.__TEST_AUTH_CONTEXT__ = {
    orgId,
    userId,
    role,
    permissions: ['*'],
  };
}

export async function resetVehiclesData(orgId: string = VEHICLES_TEST_ORG_ID) {
  await prisma.$transaction([
    prisma.loadStatusEvent.deleteMany({ where: { organizationId: orgId } }),
    prisma.loadAssignment.deleteMany({ where: { organizationId: orgId } }),
    prisma.load.deleteMany({ where: { organizationId: orgId } }),
    prisma.vehicleDocument.deleteMany({ where: { organizationId: orgId } }),
    prisma.vehicleMaintenance.deleteMany({ where: { organizationId: orgId } }),
    prisma.vehicleInspection.deleteMany({ where: { organizationId: orgId } }),
    prisma.vehicle.deleteMany({ where: { organizationId: orgId } }),
  ]);
}

export async function seedOrgAndUser(
  orgId: string = VEHICLES_TEST_ORG_ID,
  userId: string = VEHICLES_TEST_USER_ID,
  slug: string = `${orgId}-slug`,
) {
  await prisma.organization.upsert({
    where: { id: orgId },
    update: {
      slug,
      name: 'Vehicles Test Org',
      timezone: 'America/Denver',
    },
    create: {
      id: orgId,
      slug,
      name: 'Vehicles Test Org',
      timezone: 'America/Denver',
    },
  });

  await prisma.user.upsert({
    where: { id: userId },
    update: {
      email: 'manager@example.com',
      firstName: 'Manager',
      lastName: 'User',
      status: 'ACTIVE',
    },
    create: {
      id: userId,
      email: 'manager@example.com',
      firstName: 'Manager',
      lastName: 'User',
      status: 'ACTIVE',
    },
  });

  await prisma.organizationMembership.upsert({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId,
      },
    },
    update: {
      role: 'MANAGER',
      status: 'ACTIVE',
    },
    create: {
      organizationId: orgId,
      userId,
      role: 'MANAGER',
      status: 'ACTIVE',
    },
  });
}

type VehicleCreateData = Parameters<typeof prisma.vehicle.create>[0]['data'];

export async function seedVehicle(
  overrides: Partial<VehicleCreateData> = {},
  orgId: string = VEHICLES_TEST_ORG_ID,
  userId: string = VEHICLES_TEST_USER_ID,
) {
  await seedOrgAndUser(orgId, userId);
  // Strip relation inputs Prisma forbids on create to keep types aligned.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { organization, ...safeOverrides } = overrides;

  const data = {
    organizationId: orgId,
    vin: safeOverrides.vin ?? `VIN-${Math.random().toString(16).slice(2, 10)}`,
    name: safeOverrides.name ?? `Vehicle-${Math.random().toString(16).slice(2, 6)}`,
    make: safeOverrides.make ?? 'Make',
    model: safeOverrides.model ?? 'Model',
    year: safeOverrides.year ?? 2022,
    status: safeOverrides.status ?? 'ACTIVE',
    type: safeOverrides.type ?? 'TRACTOR',
    ...safeOverrides,
  } satisfies VehicleCreateData;

  return prisma.vehicle.create({ data });
}
