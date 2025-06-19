import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../upload/route'

// Mock Clerk auth to always return a valid user and org
vi.mock('@clerk/nextjs/server', () => ({ auth: () => Promise.resolve({ userId: 'u1', orgId: 'org1' }) }))

// Mock handleUpload to simulate a successful upload
vi.mock('@vercel/blob/client', () => ({
  handleUpload: vi.fn(async ({ body }) => ({ url: 'bloburl', ...body })),
}))

// Patch console.log to avoid noisy output
vi.spyOn(console, 'log').mockImplementation(() => {})

describe('file upload route', () => {
  it('returns upload response', async () => {
    const req = new NextRequest('http://localhost/api/files/upload', {
      method: 'POST',
      body: JSON.stringify({ filename: 'file.png', contentType: 'image/png' }),
      headers: new Headers({ 'content-type': 'application/json' }),
    })
    // Patch request.json to return the expected body
    req.json = async () => ({ filename: 'file.png', contentType: 'image/png' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toBe('bloburl')
    expect(json.filename).toBe('file.png')
    expect(json.contentType).toBe('image/png')
  })
})
