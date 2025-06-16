import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as actions from '../lib/actions/vehicleActions';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('../lib/database/db', () => ({
  __esModule: true,
  default: {
    vehicle: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'v1', organizationId: 'org1', type: 'tractor', status: 'available' })
    }
  }
}));
vi.mock('@/lib/errors/handleError', () => ({ handleError: vi.fn() }));
vi.mock('@/lib/auth/permissions', () => ({ hasPermission: () => true }));
vi.mock('@/schemas/vehicles', () => ({
  VehicleFormSchema: { safeParse: () => ({ success: true, data: { vin: '1', type: 'tractor', make: 'Make', model: 'Model', year: 2024 } }) }
}));
vi.mock('@clerk/nextjs/server', () => ({ auth: () => Promise.resolve({ userId: '1', orgId: 'org1' }) }));

describe('vehicle actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('revalidates list path on create', async () => {
    const { revalidatePath } = await import('next/cache');
    // Form data can be empty because schema is mocked
    const formData = new FormData();
    const result = await actions.createVehicleAction(null, formData);
    expect(result.success).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith('/org1/vehicles');
  });
});
