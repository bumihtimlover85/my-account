import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    card: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
      aggregate: vi.fn(),
    },
    subtask: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    comment: {
      create: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
  getUserFromCookie: vi.fn(),
  setTokenCookie: vi.fn(),
  removeTokenCookie: vi.fn(),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Card Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have card-related actions defined', async () => {
    const actions = await import('@/app/actions');
    expect(actions.createCard).toBeDefined();
    expect(actions.updateCard).toBeDefined();
    expect(actions.deleteCard).toBeDefined();
    expect(actions.moveCard).toBeDefined();
    expect(actions.addSubtask).toBeDefined();
    expect(actions.toggleSubtask).toBeDefined();
    expect(actions.addComment).toBeDefined();
  });

  it('should have auth actions defined', async () => {
    const actions = await import('@/app/actions');
    expect(actions.login).toBeDefined();
    expect(actions.register).toBeDefined();
    expect(actions.logout).toBeDefined();
  });
});
