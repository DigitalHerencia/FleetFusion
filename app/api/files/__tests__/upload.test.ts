import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../upload/route'

vi.mock('@vercel/blob/client', () => ({
  handleUpload: vi.fn(async () => ({ url: 'bloburl' })),
}))

describe('file upload route', () => {
  it('returns upload response', async () => {
    const req = new NextRequest('http://localhost/api/files/upload', {
      method: 'POST',
      body: JSON.stringify({ filename: 'file.png' }),
      headers: new Headers({ 'content-type': 'application/json' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
