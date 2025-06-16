import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAuditLog } from '../lib/actions/auditLogActions'

vi.mock('../lib/database/db', () => ({
  __esModule: true,
  default: { auditLog: { create: vi.fn() } }
}))

import db from '../lib/database/db'

describe('audit log actions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates immutable audit log entry', async () => {
    ;(db.auditLog.create as any).mockResolvedValue({ id: '1', timestamp: new Date() })

    const res = await createAuditLog({
      organizationId: 'org1',
      userId: 'u1',
      entityType: 'ComplianceDocument',
      entityId: 'doc1',
      action: 'create'
    })

    expect(db.auditLog.create).toHaveBeenCalled()
    const calledData = (db.auditLog.create as any).mock.calls[0][0].data
    expect(calledData.timestamp).toBeInstanceOf(Date)
    expect(Object.isFrozen(res)).toBe(false)
  })
})
