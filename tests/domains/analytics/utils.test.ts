import { describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => Promise.resolve({ userId: 'u1' }),
}));
vi.mock('../../lib/cache/auth-cache', () => ({
  getCachedData: () => null,
  setCachedData: vi.fn(),
}));
vi.mock('../../lib/database/db', () => ({ __esModule: true, default: {} }));

describe('analytics utils', () => {
  it('calculates percentage change', async () => {
    const { calculatePercentageChange } = await import('../../../lib/fetchers/analyticsFetchers');
    // Await the function if it returns a Promise
    const result1 = await calculatePercentageChange(100, 150);
    expect(result1).toBe(50);
    const result2 = await calculatePercentageChange(0, 100);
    expect(result2).toBe(100);
  });

  it('processes time series data by month', async () => {
    const { processAnalyticsData } = await import('../../../lib/fetchers/analyticsFetchers');
    const data = [
      { actualDeliveryDate: '2024-01-10', rate: 100, actualMiles: 50 },
      { actualDeliveryDate: '2024-01-20', rate: 200, actualMiles: 100 },
    ];
    const result = await processAnalyticsData(data as any[], 'month');
    expect(result.length).toBe(1);
    expect(result[0].revenue).toBe(300);
    expect(result[0].miles).toBe(150);
    expect(result[0].loads).toBe(2);
  });
});
