import { describe, it, expect, vi } from 'vitest';
import { POST } from '../../app/api/analytics/[orgId]/schedule/route';
import { NextRequest } from 'next/server';

// Patch Clerk auth to always return a valid user and org
vi.mock('@clerk/nextjs/server', () => ({ auth: () => Promise.resolve({ userId: 'u1', orgId: 'org1' }) }));

// Patch any DB or cache dependencies if needed
vi.mock('../../lib/database/db', () => ({
  __esModule: true,
  default: {
    reportSchedule: {
      create: vi.fn().mockResolvedValue({ id: 'report1', nextSendDate: new Date().toISOString() })
    }
  }
}));

function createRequest(body: any) {
  return new NextRequest('http://localhost/api/analytics/org1/schedule', { method: 'POST', body: JSON.stringify(body) });
}

describe('report scheduling', () => {
  it('schedules a report and returns nextSendDate', async () => {
    const req = createRequest({
      name: 'Weekly',
      frequency: 'weekly',
      recipients: ['test@example.com'],
      filters: {},
      metrics: ['revenue']
    });
    const res = await POST(req, { params: Promise.resolve({ orgId: 'org1' }) });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.reportId).toBeTruthy();
    expect(json.nextSendDate).toBeTruthy();
  });
});
