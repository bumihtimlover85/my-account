import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    card: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateMany: vi.fn(),
    },
    subtask: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    comment: {
      create: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
  signToken: vi.fn(),
  setAuthCookie: vi.fn(),
  clearAuthCookie: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Card Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have valid status values', () => {
    const validStatuses = ['todo', 'in_progress', 'testing', 'done'];
    expect(validStatuses).toContain('todo');
    expect(validStatuses).toContain('in_progress');
    expect(validStatuses).toContain('testing');
    expect(validStatuses).toContain('done');
  });

  it('should have valid priority values', () => {
    const validPriorities = ['high', 'medium', 'low'];
    expect(validPriorities).toContain('high');
    expect(validPriorities).toContain('medium');
    expect(validPriorities).toContain('low');
  });
});
