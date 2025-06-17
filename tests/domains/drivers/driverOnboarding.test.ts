import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createDriverAction } from '../../../lib/actions/driverActions'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('../../../lib/database/db', () => ({
  __esModule: true,
  default: { driver: { findFirst: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({ id: 'd1', organizationId: 'org1' }) } }
}))
vi.mock('@/lib/errors/handleError', () => ({ handleError: vi.fn() }))
vi.mock('@clerk/nextjs/server', () => ({ auth: () => Promise.resolve({ userId: 'u1' }) }))
vi.mock('@/schemas/drivers', () => ({ driverFormSchema: { safeParse: () => ({ success: true }), parse: (d: any) => d } }))

describe('createDriverAction', () => {
  beforeEach(() => vi.clearAllMocks())
  it('revalidates driver list after create', async () => {
    const { revalidatePath } = await import('next/cache')
    const result = await createDriverAction('org1', { firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '1234567890', hireDate: '2024-01-01', homeTerminal: 'HQ', cdlNumber: '1', cdlState: 'TX', cdlClass: 'A', cdlExpiration: '2025-01-01', medicalCardExpiration: '2025-01-01' })
    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/org1/drivers')
  })
})
