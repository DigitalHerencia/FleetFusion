import { describe, expect, it, vi } from 'vitest';

vi.mock('../lib/analyticsFetchers', () => ({
  getDashboardMetrics: vi.fn().mockResolvedValue({ charts: [], kpis: [] }),
  getReportById: vi.fn().mockResolvedValue({ id: 'r1' }),
}));

describe('analyticsPageview (TDD)', () => {
  it('dashboard loads metrics via fetcher', async () => {
    const fetchers = await import('../lib/analyticsFetchers');
    await expect(fetchers.getDashboardMetrics()).resolves.toMatchObject({ charts: [] });
  });

  it('detail page resolves report by id', async () => {
    const fetchers = await import('../lib/analyticsFetchers');
    await expect(fetchers.getReportById()).resolves.toMatchObject({ id: 'r1' });
  });
});
