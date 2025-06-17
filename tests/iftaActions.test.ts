import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as actions from '../lib/actions/iftaActions'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/database/db', () => ({
  __esModule: true,
  default: {
    user: {
      findFirst: vi.fn().mockResolvedValue({ id: 'u1', permissions: ['ifta:manage'] })
    },
    iftaTrip: {
      create: vi.fn().mockResolvedValue({ id: 't1' })
    },
    iftaFuelPurchase: {
      create: vi.fn().mockResolvedValue({ id: 'f1' })
    },
    iftaReport: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'r1' }),
      update: vi.fn()
    },
    iftaTaxCalculation: {
      upsert: vi.fn().mockResolvedValue({})
    },
    iftaAuditLog: {
      create: vi.fn().mockResolvedValue({})
    }
  }
}))
vi.mock('@clerk/nextjs/server', () => ({ auth: () => Promise.resolve({ userId: 'u1' }) }))
vi.mock('../lib/fetchers/iftaFetchers', () => ({
  getIftaDataForPeriod: vi.fn().mockResolvedValue({
    period: { quarter: 2, year: 2024 },
    summary: { totalMiles: 100, totalGallons: 10, averageMpg: 10, totalFuelCost: 50 },
    trips: [],
    fuelPurchases: [],
    jurisdictionSummary: []
  }),
  calculateQuarterlyTaxes: vi.fn().mockResolvedValue({
    period: { quarter: 2, year: 2024 },
    summary: {
      totalMiles: 100,
      totalFuelConsumed: 10,
      totalFuelPurchased: 10,
      totalTaxDue: 10,
      totalCredits: 5,
      totalNetTax: 5,
      averageMpg: 10,
      fuelBalance: 0
    },
    jurisdictions: [
      {
        jurisdiction: 'TX',
        miles: 100,
        fuelConsumed: 10,
        fuelPurchased: 10,
        taxRate: 0.1,
        taxDue: 10,
        credits: 5,
        netTax: 5
      }
    ],
    calculatedAt: new Date(),
    calculationMethod: 'ADVANCED_MPG_BASED'
  })
}))

const db = await import('@/lib/database/db')

describe('IFTA actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('logs a trip record successfully', async () => {
    const result = await actions.logIftaTripDataAction('org1', 'veh1', {
      date: '2024-04-01',
      distance: 120,
      jurisdiction: 'TX'
    })
    expect(result.success).toBe(true)
    expect(db.default.iftaTrip.create).toHaveBeenCalled()
  })

  it('fails to log invalid trip data', async () => {
    const result = await actions.logIftaTripDataAction('org1', 'veh1', { bad: true } as any)
    expect(result.success).toBe(false)
  })

  it('logs a fuel purchase successfully', async () => {
    const result = await actions.logFuelPurchaseAction('org1', 'veh1', {
      date: '2024-04-01',
      jurisdiction: 'TX',
      gallons: 50,
      amount: 100
    })
    expect(result.success).toBe(true)
    expect(db.default.iftaFuelPurchase.create).toHaveBeenCalled()
  })

  it('generates report with correct due date', async () => {
    const res = await actions.generateIftaReportAction('org1', '2', '2024')
    expect(res.success).toBe(true)
    const { create } = db.default.iftaReport
    expect(create).toHaveBeenCalled()
    const args = (create as any).mock.calls[0][0].data
    expect(new Date(args.dueDate).toISOString()).toBe(new Date(2024, 6, 31).toISOString())
  })
})
