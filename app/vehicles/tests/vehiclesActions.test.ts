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

describe('vehiclesActions (integration tests)', () => {
  beforeAll(async () => {
    ensureDatabase();
  });

  beforeEach(async () => {
    await resetVehiclesData();
    await seedOrgAndUser();
    setTestAuthContext('manager');
  });

  afterAll(async () => {
    await resetVehiclesData();
    await prisma.$disconnect();
  });

  it('createVehicle: inserts a new vehicle and returns it, enforcing unique vin and name', async () => {
    const { createVehicle } = await import('../lib/vehiclesActions');
    type CreatedVehicle = Awaited<ReturnType<typeof createVehicle>>;
    // Create a vehicle
    const input = { name: 'UniqueTruck', vin: 'UNIQUEVIN123', type: 'TRACTOR' };
    const vehicle: CreatedVehicle = await createVehicle(input);
    expect(vehicle.id).toBeDefined();
    expect(vehicle.organizationId).toBe(VEHICLES_TEST_ORG_ID);
    // Attempt to create another with same VIN should throw
    await expect(createVehicle({ name: 'OtherTruck', vin: 'UNIQUEVIN123' })).rejects.toThrow(
      /already exists/,
    );
    // Attempt with same name also throws
    await expect(createVehicle({ name: 'UniqueTruck', vin: 'NEWVIN000' })).rejects.toThrow(
      /already exists/,
    );
  });

  it('updateVehicle: updates fields of an existing vehicle and handles uniqueness checks', async () => {
    const { updateVehicle } = await import('../lib/vehiclesActions');
    type UpdatedVehicle = Awaited<ReturnType<typeof updateVehicle>>;
    // Seed a vehicle
    const vehicle = await seedVehicle({ vin: 'UPD-1', name: 'UpdateMe', make: 'Initial' });
    // Update the vehicle's make and model
    const updated: UpdatedVehicle = await updateVehicle({
      id: vehicle.id,
      make: 'UpdatedMake',
      model: 'UpdatedModel',
    });
    expect(updated.make).toBe('UpdatedMake');
    expect(updated.model).toBe('UpdatedModel');
    // Update VIN to one that conflicts with another vehicle
    const other = await seedVehicle({ vin: 'UPD-2', name: 'OtherVehicle' });
    await expect(updateVehicle({ id: vehicle.id, vin: other.vin })).rejects.toThrow(
      /already exists/,
    );
  });

  it('deleteVehicle: soft deletes a vehicle (sets deletedAt) and excludes it from listings', async () => {
    const { deleteVehicle } = await import('../lib/vehiclesActions');
    const { getVehicles } = await import('../lib/vehiclesFetchers');
    type DeletedVehicle = Awaited<ReturnType<typeof deleteVehicle>>;
    // Seed a vehicle and then delete it
    const vehicle = await seedVehicle({ vin: 'DEL-1', name: 'ToDelete' });
    const deleted: DeletedVehicle = await deleteVehicle({ id: vehicle.id });
    expect(deleted.deletedAt).not.toBeNull();
    // After deletion, vehicle should not appear in getVehicles results
    const listAfterDelete = await getVehicles({});
    expect(listAfterDelete).toEqual(
      expect.not.arrayContaining([expect.objectContaining({ id: vehicle.id })]),
    );
  });

  it('bulkImportVehicles: creates multiple vehicles in a transaction', async () => {
    const { bulkImportVehicles } = await import('../lib/vehiclesActions');
    type BulkCreatedVehicles = Awaited<ReturnType<typeof bulkImportVehicles>>;
    const rows = [
      { name: 'BulkOne', vin: 'BULK-VIN-1', type: 'TRAILER' },
      { name: 'BulkTwo', vin: 'BULK-VIN-2', type: 'TRAILER' },
    ];
    const created: BulkCreatedVehicles = await bulkImportVehicles({ rows });
    expect(created.length).toBe(2);
    const vins = created.map((v) => v.vin);
    expect(vins).toContain('BULK-VIN-1');
    expect(vins).toContain('BULK-VIN-2');
    // Ensure they belong to the test org
    expect(created.every((v) => v.organizationId === VEHICLES_TEST_ORG_ID)).toBe(true);
  });
});
