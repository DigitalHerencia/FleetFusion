import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateLoadAssignment } from '../lib/business-rules/dispatch-rules'

const mockDb = {
  load: {
    findFirst: vi.fn(),
    findMany: vi.fn()
  },
  driver: {
    findFirst: vi.fn(),
    findMany: vi.fn()
  },
  vehicle: {
    findFirst: vi.fn(),
    findMany: vi.fn()
  }
}

vi.mock('@/lib/database/db', () => ({ __esModule: true, default: mockDb }))

beforeEach(() => {
  vi.clearAllMocks()
})

function futureDate(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

describe('validateLoadAssignment', () => {
  it('returns valid when driver and vehicle available', async () => {
    mockDb.load.findFirst.mockResolvedValue({
      id: 'load1',
      organizationId: 'org1',
      equipment: { type: 'dry_van' },
      cargo: { weight: 1000 },
      pickupDate: futureDate(1),
      deliveryDate: futureDate(2)
    })
    mockDb.driver.findFirst.mockResolvedValue({
      id: 'driver1',
      organizationId: 'org1',
      status: 'active',
      medicalCardExpiration: futureDate(30),
      licenseExpiration: futureDate(30)
    })
    mockDb.load.findMany.mockResolvedValue([])
    mockDb.vehicle.findFirst.mockResolvedValue({
      id: 'vehicle1',
      organizationId: 'org1',
      status: 'active',
      type: 'dry_van',
      maxWeight: 2000,
      nextInspectionDue: futureDate(30)
    })
    mockDb.vehicle.findMany.mockResolvedValue([])

    const result = await validateLoadAssignment('load1', 'driver1', 'vehicle1', 'org1')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
    // allow informational warnings
  })

  it('fails when driver not found', async () => {
    mockDb.load.findFirst.mockResolvedValue({
      id: 'load1',
      organizationId: 'org1',
      equipment: { type: 'dry_van' },
      cargo: { weight: 1000 },
      pickupDate: futureDate(1),
      deliveryDate: futureDate(2)
    })
    mockDb.driver.findFirst.mockResolvedValue(null)
    mockDb.load.findMany.mockResolvedValue([])
    mockDb.vehicle.findFirst.mockResolvedValue({
      id: 'vehicle1',
      organizationId: 'org1',
      status: 'active',
      type: 'dry_van',
      maxWeight: 2000
    })
    mockDb.vehicle.findMany.mockResolvedValue([])

    const result = await validateLoadAssignment('load1', 'driver1', 'vehicle1', 'org1')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Driver not found or inactive')
  })

  it('fails when vehicle capacity insufficient', async () => {
    mockDb.load.findFirst.mockResolvedValue({
      id: 'load1',
      organizationId: 'org1',
      equipment: { type: 'dry_van' },
      cargo: { weight: 1500 },
      pickupDate: futureDate(1),
      deliveryDate: futureDate(2)
    })
    mockDb.driver.findFirst.mockResolvedValue({ id: 'driver1', organizationId: 'org1', status: 'active' })
    mockDb.load.findMany.mockResolvedValue([])
    mockDb.vehicle.findFirst.mockResolvedValue({
      id: 'vehicle1',
      organizationId: 'org1',
      status: 'active',
      type: 'dry_van',
      maxWeight: 1000
    })
    mockDb.vehicle.findMany.mockResolvedValue([])

    const result = await validateLoadAssignment('load1', 'driver1', 'vehicle1', 'org1')
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.includes('exceeds vehicle capacity'))).toBe(true)
  })

  it('warns when equipment mismatch', async () => {
    mockDb.load.findFirst.mockResolvedValue({
      id: 'load1',
      organizationId: 'org1',
      equipment: { type: 'dry_van' },
      cargo: { weight: 500 },
      pickupDate: futureDate(1),
      deliveryDate: futureDate(2)
    })
    mockDb.driver.findFirst.mockResolvedValue({ id: 'driver1', organizationId: 'org1', status: 'active' })
    mockDb.load.findMany.mockResolvedValue([])
    mockDb.vehicle.findFirst.mockResolvedValue({
      id: 'vehicle1',
      organizationId: 'org1',
      status: 'active',
      type: 'flatbed',
      maxWeight: 1000
    })
    mockDb.vehicle.findMany.mockResolvedValue([])

    const result = await validateLoadAssignment('load1', 'driver1', 'vehicle1', 'org1')
    expect(result.isValid).toBe(true)
    expect(result.warnings.some(w => w.includes('Vehicle type (flatbed)'))).toBe(true)
  })
})
