import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({ auth: () => Promise.resolve({ userId: 'u1' }) }));
vi.mock('../../lib/cache/auth-cache', () => ({
  getCachedData: () => null,
  setCachedData: vi.fn(),
  CACHE_TTL: { DATA: 1000 }
}));

const loadFindMany = vi.fn();
const driverCount = vi.fn();
const vehicleCount = vi.fn();
const fuelAggregate = vi.fn();
const complianceCount = vi.fn();

const mockDb = {
  load: { findMany: loadFindMany },
  driver: { count: driverCount },
  vehicle: { count: vehicleCount },
  iftaFuelPurchase: { aggregate: fuelAggregate },
  complianceAlert: { count: complianceCount }
};

vi.mock('../../lib/database/db', () => ({ __esModule: true, default: mockDb }));

describe('getDashboardSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates dashboard metrics', async () => {
    loadFindMany.mockResolvedValue([
      { status: 'delivered', rate: 1000, actualMiles: 500, actualDeliveryDate: '2024-01-05', scheduledDeliveryDate: '2024-01-05' },
      { status: 'in_transit', rate: 500, actualMiles: 200, actualDeliveryDate: '2024-01-08', scheduledDeliveryDate: '2024-01-07' }
    ]);
    driverCount.mockResolvedValue(1);
    vehicleCount
      .mockResolvedValueOnce(1) // active vehicles
      .mockResolvedValueOnce(1); // maintenance vehicles
    fuelAggregate.mockResolvedValue({ _sum: { gallons: 50 } });
    complianceCount.mockResolvedValue(2);

    const { getDashboardSummary } = await import('../../lib/fetchers/analyticsFetchers');
    const summary = await getDashboardSummary('org1', '7d');
    expect(summary.totalLoads).toBe(2);
    expect(summary.completedLoads).toBe(1);
    expect(summary.activeLoads).toBe(1);
    expect(summary.totalRevenue).toBe(1500);
    expect(summary.totalMiles).toBe(700);
    expect(summary.onTimeDeliveryRate).toBe(100);
    expect(summary.maintenanceAlerts).toBe(3);
  });
});
