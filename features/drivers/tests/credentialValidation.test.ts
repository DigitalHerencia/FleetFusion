import { describe, it, expect } from 'vitest'
import { driverFormSchema } from '../../../schemas/drivers'

describe('driverFormSchema', () => {
  it('fails when required license fields missing', () => {
    const result = driverFormSchema.safeParse({ firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '1234567890', hireDate: '2024-01-01', homeTerminal: 'HQ', cdlState: 'TX', cdlClass: 'A', cdlExpiration: '2025-01-01', medicalCardExpiration: '2025-01-01' })
    expect(result.success).toBe(false)
  })

  it('passes with complete credentials', () => {
    const result = driverFormSchema.safeParse({ firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '1234567890', hireDate: '2024-01-01', homeTerminal: 'HQ', cdlNumber: '1', cdlState: 'TX', cdlClass: 'A', cdlExpiration: '2025-01-01', medicalCardExpiration: '2025-01-01' })
    expect(result.success).toBe(true)
  })
})
