import { describe, expect, it } from 'vitest';

import { vehicleFiltersSchema, vehicleSchema } from '../schemas/vehicles.schema';

describe('vehiclesValidation (schema rules)', () => {
  it('vehicleSchema: requires name and vin, and defaults type and status', () => {
    // Missing name or vin should fail
    expect(() => vehicleSchema.parse({ organizationId: 'org_fake', vin: 'X' })).toThrow();
    expect(() => vehicleSchema.parse({ organizationId: 'org_fake', name: 'X' })).toThrow();
    // Valid minimal input
    const data = {
      organizationId: 'ck1234567',
      name: 'TestVehicle',
      vin: 'TESTVIN',
    };
    const parsed = vehicleSchema.parse(data);
    expect(parsed.name).toBe('TestVehicle');
    expect(parsed.vin).toBe('TESTVIN');
    // Defaults
    expect(parsed.type).toBe('TRACTOR');
    expect(parsed.status).toBe('ACTIVE');
  });

  it('vehicleSchema: enforces plate number/state pairing and positive numeric fields', () => {
    // Plate number without state -> error
    expect(() =>
      vehicleSchema.parse({
        organizationId: 'ckplate123',
        name: 'PlateTest',
        vin: 'VINPlate',
        plateNumber: 'ABC123',
      }),
    ).toThrow(/State is required/);
    // Plate state without number -> error
    expect(() =>
      vehicleSchema.parse({
        organizationId: 'ckplatest2',
        name: 'PlateTest2',
        vin: 'VINPlate2',
        plateState: 'CA',
      }),
    ).toThrow(/Plate number is required/);
    // Negative odometer should error
    expect(() =>
      vehicleSchema.parse({
        organizationId: 'ckodo12345',
        name: 'NegOdo',
        vin: 'VINODO',
        odometer: -100,
      }),
    ).toThrow(/cannot be negative/);
    // Year out of range should error
    expect(() =>
      vehicleSchema.parse({
        organizationId: 'ckyear1234',
        name: 'FutureCar',
        vin: 'VINYEAR',
        year: new Date().getFullYear() + 10,
      }),
    ).toThrow(/too far in the future/);
  });

  it('vehicleFiltersSchema: provides defaults and validates values', () => {
    // Default page and pageSize when not provided
    const parsed = vehicleFiltersSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(50);
    // Invalid status value should throw
    expect(() => vehicleFiltersSchema.parse({ status: 'INVALID' })).toThrow();
    // Page must be >= 1
    expect(() => vehicleFiltersSchema.parse({ page: 0 })).toThrow();
    // PageSize has max limit
    expect(() => vehicleFiltersSchema.parse({ pageSize: 1000 })).toThrow();
  });
});
