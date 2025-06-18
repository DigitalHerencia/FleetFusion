import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getDriverAnalytics } from '../../../lib/fetchers/analyticsFetchers'

vi.mock('@clerk/nextjs/server', () => ({ auth: () => ({ userId: 'u1' }) }))
vi.mock('../../../lib/cache/auth-cache', () => ({
  getCachedData: () => null,
  setCachedData: vi.fn(),
  CACHE_TTL: { DATA: 60 }
}))
vi.mock('../../../lib/database/db', () => ({
  __esModule: true,
  default: {
    driver: {
      findMany: vi.fn().mockResolvedValue([
        { id: 'd1', firstName: 'A', lastName: 'B', loads: [ { status: 'delivered', rate: 100, actualMiles: 50, actualDeliveryDate: new Date('2024-01-02'), scheduledDeliveryDate: new Date('2024-01-02') } ] }
      ])
    }
  }
}))

vi.mock('../../../lib/fetchers/analyticsFetchers', async actual => {
  const mod = await actual()
  return { ...mod, getDateRange: () => ({ startDate: new Date('2024-01-01'), endDate: new Date('2024-01-31') }) }
})

describe('getDriverAnalytics', () => {
  beforeEach(() => vi.clearAllMocks())
  it('calculates basic performance metrics', async () => {
    const data = await getDriverAnalytics('org1')
    expect(data[0].loadsCompleted).toBe(1)
    expect(data[0].totalRevenue).toBe(100)
    expect(data[0].averageRevenuePerMile).toBe(2)
  })
})
