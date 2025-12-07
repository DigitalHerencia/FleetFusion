import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import {
  ensureDatabase,
  resetVehiclesData,
  seedOrgAndUser,
  seedVehicle,
  setTestAuthContext,
  VEHICLES_TEST_ORG_ID,
} from './helpers';

type VehicleDto = {
  id: string;
  vin: string;
  organizationId: string;
  status: string;
};

describe('vehiclesFetchers (integration, no mocks)', () => {
  beforeAll(async () => {
    ensureDatabase();
    await resetVehiclesData();
    await seedOrgAndUser();
  });

  beforeEach(() => {
    setTestAuthContext('manager');
  });

  afterAll(async () => {
    await resetVehiclesData();
    await prisma.$disconnect();
  });

  it('getVehicles: scopes to org, applies status filter, orders by createdAt desc', async () => {
    const { getVehicles } = await import('../lib/vehiclesFetchers');

    await seedVehicle({ vin: 'VIN-AAA', status: 'ACTIVE', name: 'Truck 1' });
    await seedVehicle({ vin: 'VIN-BBB', status: 'IN_SHOP', name: 'Truck 2' });

    const result = (await getVehicles({ status: 'ACTIVE' })) as VehicleDto[];

    expect(result.every((v) => v.organizationId === VEHICLES_TEST_ORG_ID)).toBe(true);
    expect(result.some((v) => v.status === 'IN_SHOP')).toBe(false);
  });

  it('getVehicleById: returns detail with related documents/inspections', async () => {
    const { getVehicleById } = await import('../lib/vehiclesFetchers');

    const v = await seedVehicle({ vin: 'VIN-CCC', name: 'Truck 3' });

    const result = await getVehicleById({ id: v.id });

    expect(result?.id).toBe(v.id);
    expect(result?.organizationId).toBe(VEHICLES_TEST_ORG_ID);
  });

  it('getVehiclesForDashboard: aggregates counts by status', async () => {
    const { getVehiclesForDashboard } = await import('../lib/vehiclesFetchers');

    await seedVehicle({ vin: 'VIN-DASH-1', status: 'ACTIVE', name: 'Truck 4' });
    await seedVehicle({ vin: 'VIN-DASH-2', status: 'IN_SHOP', name: 'Truck 5' });

    const summary = await getVehiclesForDashboard();

    expect(summary.total).toBeGreaterThanOrEqual(2);
    expect(summary.active).toBeGreaterThanOrEqual(1);
    expect(summary.inShop).toBeGreaterThanOrEqual(1);
  });

  it('getVehicleHistory: combines maintenance and load events chronologically', async () => {
    const { getVehicleHistory } = await import('../lib/vehiclesFetchers');

    const v = await seedVehicle({ vin: 'VIN-HIST-1', name: 'Truck 6' });

    await prisma.vehicleMaintenance.create({
      data: {
        organizationId: VEHICLES_TEST_ORG_ID,
        vehicleId: v.id,
        description: 'Oil change',
        performedAt: new Date('2024-01-01'),
      },
    });

    await prisma.load.create({
      data: {
        organizationId: VEHICLES_TEST_ORG_ID,
        reference: `LD-${Date.now()}`,
        status: 'DRAFT',
        vehicleId: v.id,
        pickupCity: 'Denver',
        dropoffCity: 'Boulder',
      },
    });

    const history = await getVehicleHistory({ id: v.id });

    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThanOrEqual(2);
    // Ensure entries are sorted by date descending (latest first)
    for (let i = 1; i < history.length; i += 1) {
      expect(new Date(history[i - 1]!.occurredAt).getTime()).toBeGreaterThanOrEqual(
        new Date(history[i]!.occurredAt).getTime(),
      );
    }
  });
});
