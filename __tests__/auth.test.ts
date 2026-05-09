import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock dependencies before importing the module ──
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

const mockPrismaUserFindUnique = vi.fn();
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockPrismaUserFindUnique(...args),
    },
  },
}));

// Set JWT_SECRET before importing auth module
process.env.JWT_SECRET = 'test-jwt-secret-for-unit-tests';

// Import after mocks are set up
const { signToken, getCurrentUser, setAuthCookie, clearAuthCookie } = await import('@/lib/auth');
import jwt from 'jsonwebtoken';

// ─── signToken ──────────────────────────────────────────────────────────────
describe('signToken', () => {
  it('returns a non-empty string', () => {
    const token = signToken('user-123');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('includes userId in the payload', () => {
    const token = signToken('user-123');
    const decoded = jwt.verify(token, 'test-jwt-secret-for-unit-tests') as { userId: string };
    expect(decoded.userId).toBe('user-123');
  });

  it('sets expiresIn to 7d', () => {
    const token = signToken('user-123');
    const decoded = jwt.verify(token, 'test-jwt-secret-for-unit-tests') as { userId: string; exp: number };
    const now = Math.floor(Date.now() / 1000);
    const sevenDaysInSeconds = 7 * 24 * 60 * 60;
    // Allow 10s tolerance for test execution time
    expect(decoded.exp).toBeGreaterThanOrEqual(now + sevenDaysInSeconds - 10);
    expect(decoded.exp).toBeLessThanOrEqual(now + sevenDaysInSeconds + 10);
  });

  it('produces different tokens for different userIds', () => {
    const token1 = signToken('user-a');
    const token2 = signToken('user-b');
    expect(token1).not.toBe(token2);
  });
});

// ─── getCurrentUser ─────────────────────────────────────────────────────────
describe('getCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no token cookie exists', async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const result = await getCurrentUser();
    expect(result).toBeNull();
  });

  it('returns null when token cookie has no value', async () => {
    mockCookieStore.get.mockReturnValue({ value: '' });
    // Empty string is falsy in the check `if (!token) return null`
    const result = await getCurrentUser();
    expect(result).toBeNull();
  });

  it('returns null when token is invalid', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'invalid-token' });
    const result = await getCurrentUser();
    expect(result).toBeNull();
  });

  it('returns null when token is valid but user not found in DB', async () => {
    const token = signToken('nonexistent-user');
    mockCookieStore.get.mockReturnValue({ value: token });
    mockPrismaUserFindUnique.mockResolvedValue(null);
    const result = await getCurrentUser();
    expect(result).toBeNull();
    expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
      where: { id: 'nonexistent-user' },
      select: { id: true, email: true, name: true },
    });
  });

  it('returns user info when token is valid and user exists', async () => {
    const token = signToken('user-123');
    const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
    mockCookieStore.get.mockReturnValue({ value: token });
    mockPrismaUserFindUnique.mockResolvedValue(mockUser);
    const result = await getCurrentUser();
    expect(result).toEqual(mockUser);
  });

  it('returns null when token is expired', async () => {
    // Create an already-expired token
    const expiredToken = jwt.sign({ userId: 'user-123' }, 'test-jwt-secret-for-unit-tests', { expiresIn: '0s' });
    // Small delay to ensure it's expired
    await new Promise((r) => setTimeout(r, 100));
    mockCookieStore.get.mockReturnValue({ value: expiredToken });
    const result = await getCurrentUser();
    expect(result).toBeNull();
  });
});

// ─── setAuthCookie ──────────────────────────────────────────────────────────
describe('setAuthCookie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls cookieStore.set with correct token', async () => {
    await setAuthCookie('my-jwt-token');
    expect(mockCookieStore.set).toHaveBeenCalledWith('token', 'my-jwt-token', expect.objectContaining({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    }));
  });

  it('sets httpOnly to true', async () => {
    await setAuthCookie('token');
    const options = mockCookieStore.set.mock.calls[0][2];
    expect(options.httpOnly).toBe(true);
  });

  it('sets sameSite to lax', async () => {
    await setAuthCookie('token');
    const options = mockCookieStore.set.mock.calls[0][2];
    expect(options.sameSite).toBe('lax');
  });

  it('sets maxAge to 7 days (604800 seconds)', async () => {
    await setAuthCookie('token');
    const options = mockCookieStore.set.mock.calls[0][2];
    expect(options.maxAge).toBe(60 * 60 * 24 * 7); // 604800
  });

  it('sets path to /', async () => {
    await setAuthCookie('token');
    const options = mockCookieStore.set.mock.calls[0][2];
    expect(options.path).toBe('/');
  });

  it('sets secure to true in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    await setAuthCookie('token');
    const options = mockCookieStore.set.mock.calls[0][2];
    expect(options.secure).toBe(true);
    process.env.NODE_ENV = originalEnv;
  });

  it('sets secure to false in development', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    await setAuthCookie('token');
    const options = mockCookieStore.set.mock.calls[0][2];
    expect(options.secure).toBe(false);
    process.env.NODE_ENV = originalEnv;
  });
});

// ─── clearAuthCookie ────────────────────────────────────────────────────────
describe('clearAuthCookie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls cookieStore.set with empty token value', async () => {
    await clearAuthCookie();
    expect(mockCookieStore.set).toHaveBeenCalledWith('token', '', expect.objectContaining({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    }));
  });

  it('sets maxAge to 0 to clear the cookie', async () => {
    await clearAuthCookie();
    const options = mockCookieStore.set.mock.calls[0][2];
    expect(options.maxAge).toBe(0);
  });

  it('sets httpOnly to true', async () => {
    await clearAuthCookie();
    const options = mockCookieStore.set.mock.calls[0][2];
    expect(options.httpOnly).toBe(true);
  });

  it('sets secure to true in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    await clearAuthCookie();
    const options = mockCookieStore.set.mock.calls[0][2];
    expect(options.secure).toBe(true);
    process.env.NODE_ENV = originalEnv;
  });
});

// ─── Production JWT_SECRET guard ────────────────────────────────────────────
describe('JWT_SECRET production guard', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalSecret = process.env.JWT_SECRET;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.JWT_SECRET = originalSecret;
  });

  it('throws in production when JWT_SECRET is not set', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;
    // Dynamic import to re-evaluate the module with new env
    // Use vi.resetModules to clear the cache
    vi.resetModules();
    await expect(import('@/lib/auth')).rejects.toThrow(
      'JWT_SECRET environment variable is required in production'
    );
  });

  it('does not throw in development when JWT_SECRET is not set', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.JWT_SECRET;
    vi.resetModules();
    const auth = await import('@/lib/auth');
    expect(auth.signToken).toBeDefined();
  });
});
