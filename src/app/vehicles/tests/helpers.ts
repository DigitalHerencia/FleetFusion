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
export function setTestAuthContext(role: string = 'manager') {
  globalThis.__TEST_AUTH_CONTEXT__ = {
    orgId: VEHICLES_TEST_ORG_ID,
    userId: VEHICLES_TEST_USER_ID,
    role,
    permissions: ['*'],
  };
}

export async function resetVehiclesData() {
  await prisma.$transaction([
    prisma.loadStatusEvent.deleteMany({ where: { organizationId: VEHICLES_TEST_ORG_ID } }),
    prisma.loadAssignment.deleteMany({ where: { organizationId: VEHICLES_TEST_ORG_ID } }),
    prisma.load.deleteMany({ where: { organizationId: VEHICLES_TEST_ORG_ID } }),
    prisma.vehicleDocument.deleteMany({ where: { organizationId: VEHICLES_TEST_ORG_ID } }),
    prisma.vehicleMaintenance.deleteMany({ where: { organizationId: VEHICLES_TEST_ORG_ID } }),
    prisma.vehicleInspection.deleteMany({ where: { organizationId: VEHICLES_TEST_ORG_ID } }),
    prisma.vehicle.deleteMany({ where: { organizationId: VEHICLES_TEST_ORG_ID } }),
    prisma.organizationMembership.deleteMany({ where: { organizationId: VEHICLES_TEST_ORG_ID } }),
    prisma.user.deleteMany({ where: { id: VEHICLES_TEST_USER_ID } }),
    prisma.organization.deleteMany({ where: { id: VEHICLES_TEST_ORG_ID } }),
  ]);
}

export async function seedOrgAndUser() {
  await prisma.organization.create({
    data: {
      id: VEHICLES_TEST_ORG_ID,
      slug: 'vehicles-test-org',
      name: 'Vehicles Test Org',
      timezone: 'America/Denver',
    },
  });

  await prisma.user.create({
    data: {
      id: VEHICLES_TEST_USER_ID,
      email: 'manager@example.com',
      firstName: 'Manager',
      lastName: 'User',
      status: 'ACTIVE',
    },
  });

  await prisma.organizationMembership.create({
    data: {
      organizationId: VEHICLES_TEST_ORG_ID,
      userId: VEHICLES_TEST_USER_ID,
      role: 'MANAGER',
      status: 'ACTIVE',
    },
  });
}

type VehicleCreateData = Parameters<typeof prisma.vehicle.create>[0]['data'];

export async function seedVehicle(overrides: Partial<VehicleCreateData> = {}) {
  // Strip relation inputs Prisma forbids on create to keep types aligned.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { organization, ...safeOverrides } = overrides;

  const data = {
    organizationId: VEHICLES_TEST_ORG_ID,
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
