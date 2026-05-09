import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock dependencies before importing ──
const mockRevalidatePath = vi.fn();
vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

// next/navigation redirect throws a special NEXT_REDIRECT error in Next.js
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  },
}));

const mockSignToken = vi.fn();
const mockSetAuthCookie = vi.fn();
const mockClearAuthCookie = vi.fn();
const mockGetCurrentUser = vi.fn();

vi.mock('@/lib/auth', () => ({
  signToken: (...args: unknown[]) => mockSignToken(...args),
  setAuthCookie: (...args: unknown[]) => mockSetAuthCookie(...args),
  clearAuthCookie: (...args: unknown[]) => mockClearAuthCookie(...args),
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

// Prisma mock
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  transaction: {
    create: vi.fn(),
    deleteMany: vi.fn(),
    findMany: vi.fn(),
  },
  category: {
    create: vi.fn(),
    createMany: vi.fn(),
    deleteMany: vi.fn(),
    findMany: vi.fn(),
  },
  $transaction: vi.fn(async (ops: unknown[]) => {
    if (Array.isArray(ops)) { for (const op of ops) { if (typeof op === 'object' && op !== null && 'then' in (op as object)) await op; } }
  }),
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('bcryptjs', () => ({
  default: {
    hashSync: vi.fn(() => 'hashed-password'),
    compareSync: vi.fn(() => true),
  },
}));

// Import after mocks
const {
  register,
  login,
  logout,
  createTransaction,
  deleteTransaction,
  createCategory,
  deleteCategory,
  exportUserData,
  resetUserData,
} = await import('@/app/actions');

// Helper: expect redirect was called
function expectRedirect(path: string, fn: () => Promise<unknown>) {
  return expect(fn()).rejects.toThrow(`NEXT_REDIRECT:${path}`);
}

// ─── register ───────────────────────────────────────────────────────────────
describe('register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error when name is empty', async () => {
    await expect(register({ name: '', email: 'a@b.com', password: '123456' }))
      .rejects.toThrow('请填写完整信息');
  });

  it('throws error when name is whitespace-only', async () => {
    await expect(register({ name: '   ', email: 'a@b.com', password: '123456' }))
      .rejects.toThrow('请填写完整信息');
  });

  it('throws error when email is empty', async () => {
    await expect(register({ name: 'Test', email: '', password: '123456' }))
      .rejects.toThrow('请填写完整信息');
  });

  it('throws error when password is empty', async () => {
    await expect(register({ name: 'Test', email: 'a@b.com', password: '' }))
      .rejects.toThrow('请填写完整信息');
  });

  it('throws error when password is less than 6 characters', async () => {
    await expect(register({ name: 'Test', email: 'a@b.com', password: '12345' }))
      .rejects.toThrow('密码至少 6 位');
  });

  it('throws error when email is already registered', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });
    await expect(register({ name: 'Test', email: 'taken@b.com', password: '123456' }))
      .rejects.toThrow('邮箱已被注册');
  });

  it('creates user with trimmed name and email, then creates default categories', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 'new-user-id' });
    mockSignToken.mockReturnValue('jwt-token');

    await expectRedirect('/dashboard', () =>
      register({ name: '  Test User  ', email: '  test@b.com  ', password: '123456' })
    );

    // User created with trimmed values
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'Test User',
        email: 'test@b.com',
        password: 'hashed-password',
      },
    });

    // Default categories created
    expect(mockPrisma.category.createMany).toHaveBeenCalled();
    const createManyData = mockPrisma.category.createMany.mock.calls[0][0].data;
    expect(createManyData).toHaveLength(10);
    expect(createManyData[0]).toEqual(
      expect.objectContaining({ userId: 'new-user-id', name: '工资', type: 'INCOME' })
    );

    // Token generated and cookie set
    expect(mockSignToken).toHaveBeenCalledWith('new-user-id');
    expect(mockSetAuthCookie).toHaveBeenCalledWith('jwt-token');
  });

  it('redirects to /dashboard on success', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 'user-id' });
    mockSignToken.mockReturnValue('token');

    await expectRedirect('/dashboard', () =>
      register({ name: 'Test', email: 'a@b.com', password: '123456' })
    );
  });
});

// ─── login ──────────────────────────────────────────────────────────────────
describe('login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error when email is empty', async () => {
    await expect(login({ email: '', password: '123456' }))
      .rejects.toThrow('请填写完整信息');
  });

  it('throws error when email is whitespace-only', async () => {
    await expect(login({ email: '   ', password: '123456' }))
      .rejects.toThrow('请填写完整信息');
  });

  it('throws error when password is empty', async () => {
    await expect(login({ email: 'a@b.com', password: '' }))
      .rejects.toThrow('请填写完整信息');
  });

  it('throws error when user does not exist', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(login({ email: 'nobody@b.com', password: '123456' }))
      .rejects.toThrow('邮箱或密码错误');
  });

  it('throws error when password is wrong', async () => {
    const { default: bcrypt } = await import('bcryptjs');
    (bcrypt.compareSync as ReturnType<typeof vi.fn>).mockReturnValue(false);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      email: 'a@b.com',
      password: 'hashed',
    });
    await expect(login({ email: 'a@b.com', password: 'wrong' }))
      .rejects.toThrow('邮箱或密码错误');
  });

  it('signs token and sets cookie on successful login', async () => {
    const { default: bcrypt } = await import('bcryptjs');
    (bcrypt.compareSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      email: 'a@b.com',
      password: 'hashed',
    });
    mockSignToken.mockReturnValue('jwt-token');

    await expectRedirect('/dashboard', () =>
      login({ email: '  a@b.com  ', password: '123456' })
    );

    // findUnique called with trimmed email
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'a@b.com' },
    });
    expect(mockSignToken).toHaveBeenCalledWith('user-id');
    expect(mockSetAuthCookie).toHaveBeenCalledWith('jwt-token');
  });

  it('redirects to /dashboard on success', async () => {
    const { default: bcrypt } = await import('bcryptjs');
    (bcrypt.compareSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      email: 'a@b.com',
      password: 'hashed',
    });
    mockSignToken.mockReturnValue('token');

    await expectRedirect('/dashboard', () =>
      login({ email: 'a@b.com', password: '123456' })
    );
  });
});

// ─── logout ─────────────────────────────────────────────────────────────────
describe('logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clears auth cookie and redirects to /', async () => {
    await expectRedirect('/', () => logout());
    expect(mockClearAuthCookie).toHaveBeenCalled();
  });
});

// ─── createTransaction ──────────────────────────────────────────────────────
describe('createTransaction', () => {
  const validData = {
    amount: 100,
    type: 'INCOME' as const,
    categoryId: 'cat-1',
    date: '2024-06-15',
    note: 'Salary',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1', email: 'a@b.com', name: 'Test' });
  });

  it('throws error when not logged in', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    await expect(createTransaction(validData)).rejects.toThrow('未登录');
  });

  it('throws error when amount is 0', async () => {
    await expect(createTransaction({ ...validData, amount: 0 }))
      .rejects.toThrow('请输入有效金额');
  });

  it('throws error when amount is negative', async () => {
    await expect(createTransaction({ ...validData, amount: -50 }))
      .rejects.toThrow('请输入有效金额');
  });

  it('throws error when categoryId is empty', async () => {
    await expect(createTransaction({ ...validData, categoryId: '' }))
      .rejects.toThrow('请选择分类');
  });

  it('creates transaction with trimmed note', async () => {
    await createTransaction({ ...validData, note: '  hello  ' });
    expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        note: 'hello',
      }),
    });
  });

  it('creates transaction with null note when note is empty/whitespace', async () => {
    await createTransaction({ ...validData, note: '   ' });
    expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        note: null,
      }),
    });
  });

  it('creates transaction with null note when note is empty string', async () => {
    await createTransaction({ ...validData, note: '' });
    expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        note: null,
      }),
    });
  });

  it('revalidates dashboard and transactions paths', async () => {
    await createTransaction(validData);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/transactions');
  });

  it('creates transaction with correct data including date conversion', async () => {
    await createTransaction(validData);
    const callData = mockPrisma.transaction.create.mock.calls[0][0].data;
    expect(callData.amount).toBe(100);
    expect(callData.type).toBe('INCOME');
    expect(callData.categoryId).toBe('cat-1');
    expect(callData.userId).toBe('user-1');
    expect(callData.date).toBeInstanceOf(Date);
  });
});

// ─── deleteTransaction ──────────────────────────────────────────────────────
describe('deleteTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1', email: 'a@b.com', name: 'Test' });
  });

  it('throws error when not logged in', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    await expect(deleteTransaction('tx-1')).rejects.toThrow('未登录');
  });

  it('deletes only the transaction belonging to the user', async () => {
    await deleteTransaction('tx-1');
    expect(mockPrisma.transaction.deleteMany).toHaveBeenCalledWith({
      where: { id: 'tx-1', userId: 'user-1' },
    });
  });

  it('revalidates dashboard and transactions paths', async () => {
    await deleteTransaction('tx-1');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/transactions');
  });
});

// ─── createCategory ─────────────────────────────────────────────────────────
describe('createCategory', () => {
  const validData = {
    name: 'Food',
    type: 'EXPENSE' as const,
    color: '#FF0000',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1', email: 'a@b.com', name: 'Test' });
  });

  it('throws error when not logged in', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    await expect(createCategory(validData)).rejects.toThrow('未登录');
  });

  it('throws error when name is empty', async () => {
    await expect(createCategory({ ...validData, name: '' }))
      .rejects.toThrow('请输入分类名称');
  });

  it('throws error when name is whitespace-only', async () => {
    await expect(createCategory({ ...validData, name: '   ' }))
      .rejects.toThrow('请输入分类名称');
  });

  it('uses default icon "circle" when icon is not provided', async () => {
    await createCategory(validData);
    expect(mockPrisma.category.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        icon: 'circle',
      }),
    });
  });

  it('uses provided icon when given', async () => {
    await createCategory({ ...validData, icon: 'star' });
    expect(mockPrisma.category.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        icon: 'star',
      }),
    });
  });

  it('creates category with trimmed name', async () => {
    await createCategory({ ...validData, name: '  Food  ' });
    expect(mockPrisma.category.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Food',
      }),
    });
  });

  it('revalidates categories, dashboard, and transactions paths', async () => {
    await createCategory(validData);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/categories');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/transactions');
  });
});

// ─── deleteCategory ─────────────────────────────────────────────────────────
describe('deleteCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1', email: 'a@b.com', name: 'Test' });
  });

  it('throws error when not logged in', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    await expect(deleteCategory('cat-1')).rejects.toThrow('未登录');
  });

  it('deletes only the category belonging to the user', async () => {
    await deleteCategory('cat-1');
    expect(mockPrisma.category.deleteMany).toHaveBeenCalledWith({
      where: { id: 'cat-1', userId: 'user-1' },
    });
  });

  it('revalidates categories, dashboard, and transactions paths', async () => {
    await deleteCategory('cat-1');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/categories');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/transactions');
  });
});

// ─── exportUserData ─────────────────────────────────────────────────────────
describe('exportUserData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1', email: 'test@b.com', name: 'Test User' });
  });

  it('throws error when not logged in', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    await expect(exportUserData()).rejects.toThrow('未登录');
  });

  it('returns user info and data', async () => {
    const mockTransactions = [{ id: 'tx-1', amount: 100 }];
    const mockCategories = [{ id: 'cat-1', name: 'Food' }];
    mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
    mockPrisma.category.findMany.mockResolvedValue(mockCategories);

    const result = await exportUserData();

    expect(result).toEqual({
      user: { name: 'Test User', email: 'test@b.com' },
      transactions: mockTransactions,
      categories: mockCategories,
    });
  });

  it('queries transactions and categories with correct userId filter', async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.category.findMany.mockResolvedValue([]);

    await exportUserData();

    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { date: 'desc' },
    });
    expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { createdAt: 'asc' },
    });
  });
});

// ─── resetUserData ──────────────────────────────────────────────────────────
describe('resetUserData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1', email: 'a@b.com', name: 'Test' });
  });

  it('throws error when not logged in', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    await expect(resetUserData()).rejects.toThrow('未登录');
  });

  it('deletes all transactions and categories in a transaction', async () => {
    await resetUserData();
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('recreates default categories after reset', async () => {
    await resetUserData();
    expect(mockPrisma.category.createMany).toHaveBeenCalled();
    const createManyData = mockPrisma.category.createMany.mock.calls[0][0].data;
    expect(createManyData).toHaveLength(10);
    expect(createManyData[0]).toEqual(
      expect.objectContaining({ userId: 'user-1', name: '工资', type: 'INCOME' })
    );
  });

  it('revalidates all relevant paths after reset', async () => {
    await resetUserData();
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/transactions');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/categories');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/settings');
  });
});
