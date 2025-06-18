import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as actions from '../../../lib/actions/vehicleActions'
import { listVehiclesByOrg } from '../../../lib/fetchers/vehicleFetchers'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

vi.mock('../../../lib/database/db', () => ({
  __esModule: true,
  default: {
    vehicle: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    load: {
      create: vi.fn(),
    },
  },
}))

vi.mock('../../../lib/errors/handleError', () => ({ handleError: vi.fn() }))

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => Promise.resolve({ userId: 'u1', orgId: 'org1' }),
}))

vi.mock('../../../schemas/vehicles', async () => {
  const actual = await vi.importActual<typeof import('../../../schemas/vehicles')>('../../../schemas/vehicles')
  return {
    __esModule: true,
    ...actual,
    VehicleFormSchema: { safeParse: () => ({ success: true, data: { vin: '1XP5DB9X7YN525486', type: 'tractor', make: 'Make', model: 'Model', year: 2024 } }) },
    VehicleUpdateStatusSchema: { parse: () => ({ status: 'out_of_service', notes: '' }) },
  }
})

import db from '../../../lib/database/db'

describe('vehicles domain', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates VIN format', async () => {
    const schemas = await vi.importActual<typeof import('../../../schemas/vehicles')>('../../../schemas/vehicles')
    expect(() => schemas.VehicleFormSchema.parse({
      type: 'tractor',
      make: 'Make',
      model: 'Model',
      year: 2024,
      vin: '1XP5DB9X7YN525486',
    })).not.toThrow()

    expect(() => schemas.VehicleFormSchema.parse({
      type: 'tractor',
      make: 'Make',
      model: 'Model',
      year: 2024,
      vin: 'INVALIDVIN',
    })).toThrow()
  })

  it('creates a vehicle', async () => {
    const formData = new FormData()
    formData.append('vin', '1XP5DB9X7YN525486')
    formData.append('type', 'tractor')
    formData.append('make', 'Make')
    formData.append('model', 'Model')
    formData.append('year', '2024')

    db.vehicle.findFirst.mockResolvedValue(null)
    db.vehicle.create.mockResolvedValue({ id: 'v1', organizationId: 'org1', type: 'tractor', status: 'active' })

    const result = await actions.createVehicleAction(null, formData)

    expect(result.success).toBe(true)
    expect(db.vehicle.create).toHaveBeenCalled()
  })

  it('fails when VIN exists', async () => {
    const formData = new FormData()
    formData.append('vin', '1XP5DB9X7YN525486')
    formData.append('type', 'tractor')
    formData.append('make', 'Make')
    formData.append('model', 'Model')
    formData.append('year', '2024')

    db.vehicle.findFirst.mockResolvedValue({ id: 'existing' })

    const result = await actions.createVehicleAction(null, formData)

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/already exists/)
  })

  it('updates vehicle', async () => {
    const formData = new FormData()
    formData.append('vehicleId', 'v1')
    formData.append('vin', '1XP5DB9X7YN525486')
    formData.append('type', 'tractor')
    formData.append('make', 'Make')
    formData.append('model', 'Model')
    formData.append('year', '2024')

    db.vehicle.findUnique.mockResolvedValue({ id: 'v1', organizationId: 'org1', vin: '1XP5DB9X7YN525486' })
    db.vehicle.update.mockResolvedValue({ id: 'v1', organizationId: 'org1', type: 'tractor', status: 'active' })

    const result = await actions.updateVehicleAction(null, formData)

    expect(result.success).toBe(true)
    expect(db.vehicle.update).toHaveBeenCalled()
  })

  it('fails update with VIN conflict', async () => {
    const formData = new FormData()
    formData.append('vehicleId', 'v1')
    formData.append('vin', '1XP5DB9X7YN525486')
    formData.append('type', 'tractor')
    formData.append('make', 'Make')
    formData.append('model', 'Model')
    formData.append('year', '2024')

    db.vehicle.findUnique.mockResolvedValue({ id: 'v1', organizationId: 'org1', vin: 'DIFFERENTVIN' })
    db.vehicle.findFirst.mockResolvedValue({ id: 'conflict' })

    const result = await actions.updateVehicleAction(null, formData)

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/already exists/)
  })

  it('updates vehicle status', async () => {
    db.vehicle.findUnique.mockResolvedValue({ id: 'v1', organizationId: 'org1', status: 'active' })
    db.vehicle.update.mockResolvedValue({ id: 'v1', organizationId: 'org1', status: 'inactive' })

    const result = await actions.updateVehicleStatusAction('v1', { status: 'out_of_service' })

    expect(result.success).toBe(true)
    expect(db.vehicle.update).toHaveBeenCalled()
  })

  it('deletes vehicle', async () => {
    db.vehicle.findUnique.mockResolvedValue({ organizationId: 'org1' })
    db.vehicle.delete.mockResolvedValue({})

    const result = await actions.deleteVehicleAction('v1')

    expect(result.success).toBe(true)
    expect(db.vehicle.delete).toHaveBeenCalledWith({ where: { id: 'v1' } })
  })

  it('assigns vehicle to driver', async () => {
    db.vehicle.findUnique.mockResolvedValue({ id: 'v1', organizationId: 'org1', status: 'active' })
    db.load.create.mockResolvedValue({ id: 'load1' })
    db.vehicle.findUnique.mockResolvedValueOnce({ id: 'v1', organizationId: 'org1', status: 'active' })
    db.vehicle.findUnique.mockResolvedValueOnce({ id: 'v1', organizationId: 'org1', status: 'active' })

    const result = await actions.assignVehicleToDriverAction('v1', 'd1')

    expect(result.success).toBe(true)
    expect(db.load.create).toHaveBeenCalled()
  })

  it('lists vehicles with filters', async () => {
    // @ts-ignore - dynamic mock methods
    db.vehicle.findMany = vi.fn().mockResolvedValue([
      {
        id: 'v1',
        organizationId: 'org1',
        type: 'tractor',
        status: 'active',
        vin: '1XP5DB9X7YN525486',
        make: 'Make',
        model: 'Model',
        year: 2024,
      },
    ])
    // @ts-ignore
    db.vehicle.count = vi.fn().mockResolvedValue(1)

    const { vehicles } = await listVehiclesByOrg('org1', { search: 'Make' })

    expect(vehicles.length).toBe(1)
    // @ts-ignore
    expect(db.vehicle.findMany).toHaveBeenCalled()
  })
})

