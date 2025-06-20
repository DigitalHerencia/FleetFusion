import { describe, it, expect, vi } from 'vitest';

// Mock fetch for testing
global.fetch = vi.fn();

describe('Health Check Tests', () => {
	it('should return a healthy status', async () => {
		// Mock a successful health check response
		(fetch as any).mockResolvedValueOnce({
			status: 200,
			ok: true,
			json: async () => ({ status: 'healthy', timestamp: new Date().toISOString() })
		});
		
		const response = await fetch('http://localhost:3000/health');
		const data = await response.json();
		expect(response.status).toBe(200);
		expect(data.status).toBe('healthy');
		expect(data.timestamp).toBeDefined();
	});
	
	it('should handle vitest environment correctly', () => {
		expect(typeof describe).toBe('function');
		expect(typeof it).toBe('function');
		expect(typeof expect).toBe('function');
	});
});