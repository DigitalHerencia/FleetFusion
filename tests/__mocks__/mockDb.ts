// Shared Vitest mocks for db and analytics
import { vi } from 'vitest';

export const mockDbMethods = {
  vehicle: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  load: {
    create: vi.fn(),
  },
  driver: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  file: {
    create: vi.fn(),
  },
};

export const mockGetDriverAnalytics = vi.fn();
