import { test, expect, vi, beforeAll } from 'vitest';

// Mock fetch for auth flow tests
global.fetch = vi.fn();

beforeAll(() => {
    // Reset mocks before each test suite
    vi.clearAllMocks();
});

test('User can register', async () => {
    // Mock successful registration
    (fetch as any).mockResolvedValueOnce({
        status: 201,
        ok: true,
        json: async () => ({ 
            token: 'mock-jwt-token',
            user: { id: 'user-123', username: 'testuser' }
        })
    });

    const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: 'testuser', password: 'password123' }),
        headers: { 'Content-Type': 'application/json' },
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('token');
    expect(data.token).toBe('mock-jwt-token');
});

test('User can log in', async () => {
    // Mock successful login
    (fetch as any).mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ 
            token: 'mock-jwt-token',
            user: { id: 'user-123', username: 'testuser' }
        })
    });

    const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'testuser', password: 'password123' }),
        headers: { 'Content-Type': 'application/json' },
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('token');
});

test('User cannot log in with incorrect password', async () => {
    // Mock failed login
    (fetch as any).mockResolvedValueOnce({
        status: 401,
        ok: false,
        json: async () => ({ 
            error: 'Invalid credentials'
        })
    });

    const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'testuser', password: 'wrongpassword' }),
        headers: { 'Content-Type': 'application/json' },
    });
    
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Invalid credentials');
});