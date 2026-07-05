import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCard, updateCard, deleteCard } from '@/app/actions';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    card: {
      aggregate: vi.fn().mockResolvedValue({ _max: { position: 0 } }),
      create: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ id: '1', name: 'Test', email: 'test@example.com' }),
  signToken: vi.fn().mockReturnValue('token'),
  setAuthCookie: vi.fn().mockResolvedValue(undefined),
  clearAuthCookie: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Card Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createCard 应创建卡片', async () => {
    const result = await createCard({ title: 'Test Card', priority: 'medium', status: 'todo' });
    expect(result).toBeUndefined();
  });

  it('updateCard 应更新卡片', async () => {
    const result = await updateCard('1', { title: 'Updated' });
    expect(result).toBeUndefined();
  });

  it('deleteCard 应删除卡片', async () => {
    const result = await deleteCard('1');
    expect(result).toBeUndefined();
  });
});
