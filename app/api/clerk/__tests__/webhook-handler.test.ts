import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
process.env.CLERK_WEBHOOK_SECRET = 'whsec_test'
const route = () => import('../webhook-handler/route')

vi.mock('svix', () => ({
  Webhook: class {
    verify() {
      return { data: { id: 'evt_1' }, type: 'user.created' }
    }
  },
}))

vi.mock('@/lib/database/db', () => ({
  __esModule: true,
  default: { webhookEvent: { upsert: vi.fn() } },
  DatabaseQueries: { upsertUser: vi.fn() },
}))

describe('webhook handler', () => {
  it('processes Clerk event', async () => {
    const { POST } = await route()
    const req = new NextRequest('http://localhost/api/clerk/webhook-handler', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: new Headers({
        'svix-id': '1',
        'svix-timestamp': '1',
        'svix-signature': 'sig',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
