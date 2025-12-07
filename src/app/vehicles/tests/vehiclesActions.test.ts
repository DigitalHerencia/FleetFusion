import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';

import {
  bulkImportVehicles,
  createVehicle,
  deleteVehicle,
  updateVehicle,
} from '../lib/vehiclesActions';
import {
  ensureDatabase,
  resetVehiclesData,
  seedOrgAndUser,
  setTestAuthContext,
  VEHICLES_TEST_ORG_ID,
} from './helpers';

type CreateVehicleInput = {
  vin: string;
  name: string;
  make: string;
  model: string;
  year: number;
  status: string;
  type: string;
};

type UpdateVehicleInput = {
  id: string;
  make?: string;
  model?: string;
  status?: string;
};

type BulkImportVehiclesInput = {
  rows: CreateVehicleInput[];
};

type VehicleRecord = {
  id: string;
  organizationId: string;
  vin?: string | null;
  name?: string | null;
  status?: string | null;
  deletedAt?: Date | null;
};

describe('vehiclesActions (integration, no mocks)', () => {
  beforeAll(async () => {
    if (!process.env['DATABASE_URL']) {
      throw new Error('DATABASE_URL must be set for integration tests');
    }
    ensureDatabase();
    await resetVehiclesData();
    await seedOrgAndUser();
  });

  beforeEach(() => {
    setTestAuthContext();
  });

  afterAll(async () => {
    await resetVehiclesData();
    await prisma.$disconnect();
  });

  it('creates a vehicle scoped to the org and returns normalized data', async () => {
    const createVehicleAction = createVehicle as unknown as (
      input: CreateVehicleInput,
    ) => Promise<VehicleRecord>;

    const vehicle = await createVehicleAction({
      vin: '1XPBDP9X5JD456789',
      name: 'TT-100',
      make: 'Peterbilt',
      model: '579',
      year: 2023,
      status: 'ACTIVE',
      type: 'TRACTOR',
    });

    expect(vehicle).toMatchObject({
      vin: '1XPBDP9X5JD456789',
      organizationId: VEHICLES_TEST_ORG_ID,
    });

    const persisted = await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicle.id } });
    expect(persisted.organizationId).toBe(VEHICLES_TEST_ORG_ID);
  });

  it('updates a vehicle within the org', async () => {
    const createVehicleAction = createVehicle as unknown as (
      input: CreateVehicleInput,
    ) => Promise<VehicleRecord>;
    const updateVehicleAction = updateVehicle as unknown as (
      input: UpdateVehicleInput,
    ) => Promise<VehicleRecord>;

    const created = await createVehicleAction({
      vin: '1FUJGLDR4CL123789',
      name: 'TT-200',
      make: 'Freightliner',
      model: 'Cascadia',
      year: 2021,
      status: 'ACTIVE',
      type: 'TRACTOR',
    });

    const updated = await updateVehicleAction({
      id: created.id,
      make: 'Freightliner',
      model: 'Cascadia',
      status: 'IN_SHOP',
    });

    expect(updated.status).toBe('IN_SHOP');

    const persisted = await prisma.vehicle.findUniqueOrThrow({ where: { id: created.id } });
    expect(persisted.status).toBe('IN_SHOP');
  });

  it('soft-deletes a vehicle within the org', async () => {
    const createVehicleAction = createVehicle as unknown as (
      input: CreateVehicleInput,
    ) => Promise<VehicleRecord>;
    const deleteVehicleAction = deleteVehicle as unknown as (input: {
      id: string;
    }) => Promise<VehicleRecord>;

    const created = await createVehicleAction({
      vin: '3HSDZAPR8JN123456',
      name: 'TT-300',
      make: 'International',
      model: 'LT',
      year: 2022,
      status: 'ACTIVE',
      type: 'TRACTOR',
    });

    const deleted = await deleteVehicleAction({ id: created.id });
    expect(deleted.id).toBe(created.id);

    const persisted = await prisma.vehicle.findUniqueOrThrow({ where: { id: created.id } });
    expect(persisted.deletedAt).not.toBeNull();
  });

  it('bulk imports multiple vehicles with validation enforced per row', async () => {
    const bulkImportAction = bulkImportVehicles as unknown as (
      input: BulkImportVehiclesInput,
    ) => Promise<VehicleRecord[]>;

    const result = await bulkImportAction({
      rows: [
        {
          vin: '1M8GDM9AXKP042788',
          name: 'TT-400',
          make: 'Mack',
          model: 'Anthem',
          year: 2020,
          status: 'ACTIVE',
          type: 'TRACTOR',
        },
        {
          vin: '4V4NC9TH6FN191824',
          name: 'TT-401',
          make: 'Volvo',
          model: 'VNL',
          year: 2019,
          status: 'ACTIVE',
          type: 'TRACTOR',
        },
      ],
    });

    expect(result.length).toBe(2);

    const vehicles = await prisma.vehicle.findMany({
      where: { organizationId: VEHICLES_TEST_ORG_ID, name: { in: ['TT-400', 'TT-401'] } },
    });
    expect(vehicles).toHaveLength(2);
  });
});
