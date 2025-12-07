import { VehicleStatus, VehicleType } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { vehicleFiltersSchema, vehicleSchema } from '../schemas/vehicles.schema';

describe('vehicles.schema (Zod)', () => {
  it('rejects invalid VINs and missing required fields', () => {
    const result = vehicleSchema.safeParse({
      vin: 'shortvin',
      year: 2025,
      make: 'Kenworth',
      model: 'T680',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('vin'))).toBe(true);
    }
  });

  it('accepts valid VIN, required fields, and defaults enums', () => {
    const payload = {
      vin: '1XPBDP9X5JD456789',
      name: 'TT-300',
      make: 'Peterbilt',
      model: '579',
      year: 2023,
    };

    const parsed = vehicleSchema.safeParse(payload);

    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw parsed.error;
    }

    expect(parsed.data.status).toBe(VehicleStatus.ACTIVE);
    expect(parsed.data.type).toBe(VehicleType.TRACTOR);
    expect(parsed.data.vin).toBe(payload.vin);
  });

  it('validates filter pagination, status, and type enums', () => {
    const valid = vehicleFiltersSchema.safeParse({
      page: 1,
      pageSize: 20,
      status: VehicleStatus.ACTIVE,
      type: VehicleType.TRACTOR,
    });
    const invalid = vehicleFiltersSchema.safeParse({ page: -1, status: 'UNKNOWN' });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });
});
