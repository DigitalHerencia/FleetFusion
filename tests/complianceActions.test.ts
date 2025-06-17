import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createComplianceDocument, generateExpirationAlertsAction } from '../lib/actions/complianceActions'
import { cleanupAuditLogs } from '../lib/actions/auditActions'
import { createAuditLog } from '../lib/actions/auditLogActions'
import { getCurrentUser } from '../lib/auth/auth'

vi.mock('../lib/auth/auth', () => ({ getCurrentUser: vi.fn() }))
vi.mock('../lib/actions/auditLogActions', () => ({ createAuditLog: vi.fn() }))

vi.mock('../lib/database/db', () => ({
  __esModule: true,
  default: {
    complianceDocument: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn()
    },
    complianceAlert: {
      create: vi.fn(),
      findFirst: vi.fn()
    },
    auditLog: {
      deleteMany: vi.fn()
    }
  }
}))

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }))

import db from '../lib/database/db'
import { auth as authModule } from '@clerk/nextjs/server'

describe('compliance domain actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates compliance document and alert when expired', async () => {
    ;(getCurrentUser as any).mockResolvedValue({ userId: 'u1', organizationId: 'org1' })
    ;(db.complianceDocument.findFirst as any).mockResolvedValue(null)
    ;(db.complianceDocument.create as any).mockResolvedValue({ id: 'doc1', title: 'CDL', expirationDate: new Date('2000-01-01') })

    const input = {
      entityType: 'driver',
      entityId: 'd1',
      type: 'cdl_license',
      name: 'CDL',
      documentNumber: '123',
      issuingAuthority: 'DMV',
      expirationDate: '2000-01-01',
      issuedDate: '1990-01-01',
      notes: '',
      tags: []
    }

    const res = await createComplianceDocument(input as any)

    expect(res.success).toBe(true)
    expect(db.complianceDocument.create).toHaveBeenCalled()
    expect(createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ entityId: 'doc1', action: 'create' }))
    expect(db.complianceAlert.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: 'expiring_document' })
      })
    )
  })

  it('generates expiration alerts for upcoming docs', async () => {
    ;(getCurrentUser as any).mockResolvedValue({ userId: 'u1', organizationId: 'org1' })
    ;(db.complianceDocument.findMany as any).mockResolvedValue([
      { id: 'doc2', title: 'Insurance', driverId: null, vehicleId: 'v1', expirationDate: new Date(Date.now() + 2 * 86400000) }
    ])
    ;(db.complianceAlert.findFirst as any).mockResolvedValue(null)

    const res = await generateExpirationAlertsAction(7)

    expect(res.success).toBe(true)
    expect(db.complianceAlert.create).toHaveBeenCalledTimes(1)
  })

  it('cleans up old audit logs', async () => {
    ;(authModule as any).mockResolvedValue({ userId: 'u1', orgId: 'org1' })
    ;(db.auditLog.deleteMany as any).mockResolvedValue({ count: 5 })

    const res = await cleanupAuditLogs(30)

    expect(res).toEqual({ success: true, deletedCount: 5 })
    expect(db.auditLog.deleteMany).toHaveBeenCalled()
  })
})
