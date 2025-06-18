import { describe, it, expect } from 'vitest'
import { calculateHosStatus } from '../../../lib/utils/hos'
import type { HosLog } from '../../../types/compliance'

function makeLog(hours: number, status: 'driving' | 'on_duty') : HosLog {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0))
  const logs = [] as any[]
  for (let i = 0; i < hours; i++) {
    const s = new Date(start.getTime() + i * 3600 * 1000)
    const e = new Date(start.getTime() + (i + 1) * 3600 * 1000)
    logs.push({ status, location: 'A', startTime: s.toISOString(), endTime: e.toISOString(), duration: 60 })
  }
  return { id: 'h1', driverId: 'd1', logs } as unknown as HosLog
}

describe('calculateHosStatus', () => {
  it('flags violation when driving exceeds 11 hours', () => {
    const status = calculateHosStatus('d1', [makeLog(12, 'driving')])
    expect(status.violations.length).toBeGreaterThan(0)
    expect(status.complianceStatus).toBe('violation')
  })
})
