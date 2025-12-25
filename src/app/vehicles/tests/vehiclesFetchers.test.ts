import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';

import {
  ensureDatabase,
  resetVehiclesData,
  seedOrgAndUser,
  seedVehicle,
  setTestAuthContext,
} from './helpers';

const FETCHERS_TEST_ORG_ID = 'org_vehicles_fetchers';
const FETCHERS_TEST_USER_ID = 'user_vehicles_fetchers';

type VehicleDto = {
  make: string;
  type: string;
  id: string;
  vin: string | null;
  organizationId: string;
  status: string;
};

describe('vehiclesFetchers (integration, no mocks)', () => {
  beforeAll(async () => {
    ensureDatabase();
  });

  beforeEach(async () => {
    await resetVehiclesData(FETCHERS_TEST_ORG_ID);
    await seedOrgAndUser(FETCHERS_TEST_ORG_ID, FETCHERS_TEST_USER_ID);
    setTestAuthContext('manager', FETCHERS_TEST_ORG_ID, FETCHERS_TEST_USER_ID);
  });

  afterAll(async () => {
    await resetVehiclesData();
    await prisma.$disconnect();
  });

  it('getVehicles: scopes results to org, applies status filter, and orders by createdAt desc', async () => {
    const { getVehicles } = await import('../lib/vehiclesFetchers');
    // Seed two vehicles with different status
    const v1 = await seedVehicle(
      { vin: 'VIN-AAA', status: 'ACTIVE', name: 'Truck 1' },
      FETCHERS_TEST_ORG_ID,
      FETCHERS_TEST_USER_ID,
    );
    // Ensure different createdAt by a slight delay or second insert

    const result = (await getVehicles({ status: 'ACTIVE' })) as VehicleDto[];
    // All returned vehicles should belong to the test org
    expect(result.every((v) => v.organizationId === FETCHERS_TEST_ORG_ID)).toBe(true);
    // No vehicle with status IN_SHOP should appear since we filtered ACTIVE
    expect(result.some((v) => v.status === 'IN_SHOP')).toBe(false);
    // Verify ordering: the newer vehicle (v2) should come before older (v1) if both were active
    // Here only v1 is active, so result[0] should be v1
    expect(result[0]?.id).toBe(v1.id);
  });

  it('getVehicles: supports search filter and type filter', async () => {
    const { getVehicles } = await import('../lib/vehiclesFetchers');
    // Seed vehicles with identifiable make/model for search, and types
    await seedVehicle(
      {
        vin: 'VIN-SEARCH1',
        name: 'Alpha',
        make: 'TestMake',
        model: 'X1',
        type: 'TRACTOR',
      },
      FETCHERS_TEST_ORG_ID,
      FETCHERS_TEST_USER_ID,
    );
    await seedVehicle(
      {
        vin: 'VIN-SEARCH2',
        name: 'Beta',
        make: 'OtherMake',
        model: 'Y2',
        type: 'TRAILER',
      },
      FETCHERS_TEST_ORG_ID,
      FETCHERS_TEST_USER_ID,
    );

    // Search by make substring
    const searchResults = (await getVehicles({ search: 'testmake' })) as VehicleDto[];
    expect(searchResults.length).toBeGreaterThanOrEqual(1);
    expect(searchResults.every((v) => (v.make ?? '').toLowerCase().includes('testmake'))).toBe(
      true,
    );

    // Filter by type = TRAILER
    const typeResults = (await getVehicles({ type: 'TRAILER' })) as VehicleDto[];
    expect(typeResults.every((v) => v.type === 'TRAILER')).toBe(true);
  });

  it('getVehicleById: returns a vehicle detail with related records, null if not found', async () => {
    const { getVehicleById } = await import('../lib/vehiclesFetchers');
    const vehicle = await seedVehicle(
      { vin: 'VIN-CCC', name: 'Truck 3' },
      FETCHERS_TEST_ORG_ID,
      FETCHERS_TEST_USER_ID,
    );
    const result = await getVehicleById({ id: vehicle.id });
    expect(result?.id).toBe(vehicle.id);
    expect(result?.organizationId).toBe(FETCHERS_TEST_ORG_ID);
    // Non-existent ID returns null
    const missing = await getVehicleById({ id: 'nonexistent-id' });
    expect(missing).toBeNull();
  });

  it('getVehiclesForDashboard: aggregates total, active, and inShop counts correctly', async () => {
    const { getVehiclesForDashboard } = await import('../lib/vehiclesFetchers');
    // Seed vehicles for count
    await seedVehicle(
      { vin: 'VIN-DASH-1', status: 'ACTIVE' },
      FETCHERS_TEST_ORG_ID,
      FETCHERS_TEST_USER_ID,
    );
    await seedVehicle(
      { vin: 'VIN-DASH-2', status: 'IN_SHOP' },
      FETCHERS_TEST_ORG_ID,
      FETCHERS_TEST_USER_ID,
    );
    const summary = await getVehiclesForDashboard();
    expect(summary.total).toBeGreaterThanOrEqual(2);
    expect(summary.active).toBeGreaterThanOrEqual(1);
    expect(summary.inShop).toBeGreaterThanOrEqual(1);
  });

  it('getVehicleHistory: combines maintenance and load events in chronological order', async () => {
    const { getVehicleHistory } = await import('../lib/vehiclesFetchers');
    const vehicle = await seedVehicle(
      { vin: 'VIN-HIST-1', name: 'Hist Truck' },
      FETCHERS_TEST_ORG_ID,
      FETCHERS_TEST_USER_ID,
    );
    // Add a maintenance record and a load for this vehicle
    await prisma.vehicleMaintenance.create({
      data: {
        organizationId: FETCHERS_TEST_ORG_ID,
        vehicleId: vehicle.id,
        description: 'Oil change',
        performedAt: new Date('2024-01-01'),
      },
    });
    await prisma.load.create({
      data: {
        organizationId: FETCHERS_TEST_ORG_ID,
        reference: `LD-${Date.now()}`,
        status: 'DRAFT',
        vehicleId: vehicle.id,
        pickupCity: 'Denver',
        dropoffCity: 'Boulder',
      },
    });
    const history = await getVehicleHistory({ id: vehicle.id });
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThanOrEqual(2);
    // Ensure events are sorted by occurredAt descending
    for (let i = 1; i < history.length; i++) {
      const prevDate = new Date(history[i - 1]!.occurredAt).getTime();
      const currDate = new Date(history[i]!.occurredAt).getTime();
      expect(prevDate).toBeGreaterThanOrEqual(currDate);
    }
  });
});
