import { describe, it, expect, vi } from 'vitest';
import { POST } from '../../../app/api/analytics/[orgId]/schedule/route';
import { NextRequest } from 'next/server';

vi.mock('@clerk/nextjs/server', () => ({ auth: () => Promise.resolve({ userId: 'u1' }) }));

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
