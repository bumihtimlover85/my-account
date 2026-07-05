import { vi, describe, it, expect, beforeEach } from 'vitest'
const mockPrisma: any = {
  user: { findUnique: vi.fn(), create: vi.fn() },
  board: { findUnique: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  column: { create: vi.fn(), update: vi.fn(), delete: vi.fn(), findUnique: vi.fn(), aggregate: vi.fn() },
  card: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), aggregate: vi.fn(), updateMany: vi.fn() },
  subtask: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  comment: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
  $transaction: vi.fn((fn: any) => fn(mockPrisma)),
}
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({
    get: vi.fn((name: string) => name === 'token' ? { value: 'test-token' } : undefined),
    set: vi.fn(), delete: vi.fn(),
  })),
}))
vi.mock('jsonwebtoken', () => ({
  default: { sign: vi.fn(() => 'tok'), verify: vi.fn(() => ({ userId: 'user-1' })) },
}))
vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn(() => Promise.resolve('hashed')), compare: vi.fn(() => Promise.resolve(true)) },
}))
const authUser = { id: 'user-1', email: 'test@test.com', name: 'Test' }
function resetAllMocks() {
  Object.values(mockPrisma).forEach((mock: any) => {
    if (typeof mock === 'object' && mock !== null) {
      Object.values(mock).forEach((fn: any) => { if (fn?.mockReset) fn.mockReset() })
    } else if (mock?.mockReset) mock.mockReset()
  })
  mockPrisma.user.findUnique.mockResolvedValue(authUser)
}
describe('认证功能', () => {
  beforeEach(() => { resetAllMocks() })
  it('register 成功', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({ ...authUser, password: 'hashed', createdAt: new Date(), updatedAt: new Date() })
    const { register } = await import('@/app/actions')
    const result = await register('test@test.com', 'password123', 'Test')
    expect(result.user).toBeDefined()
    expect(result.user!.email).toBe('test@test.com')
  })
  it('register 重复邮箱', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(authUser)
    const { register } = await import('@/app/actions')
    const result = await register('test@test.com', 'password123')
    expect(result.error).toBe('该邮箱已被注册')
  })
})
describe('看板功能', () => {
  beforeEach(() => { resetAllMocks() })
  it('createBoard 成功', async () => {
    mockPrisma.board.create.mockResolvedValue({ id: 'b1', name: 'Test Board', userId: 'user-1', createdAt: new Date(), updatedAt: new Date() })
    mockPrisma.column.create.mockResolvedValue({ id: 'c1', name: '待办', position: 0, boardId: 'b1' })
    const { createBoard } = await import('@/app/actions')
    const result = await createBoard({ name: 'Test Board' })
    expect(result.board).toBeDefined()
    expect(result.board!.name).toBe('Test Board')
  })
  it('deleteBoard 成功', async () => {
    mockPrisma.board.findFirst.mockResolvedValue({ id: 'b1', userId: 'user-1' })
    mockPrisma.board.delete.mockResolvedValue({ id: 'b1' })
    const { deleteBoard } = await import('@/app/actions')
    const result = await deleteBoard('b1')
    expect(result.success).toBe(true)
  })
  it('deleteBoard 不存在', async () => {
    mockPrisma.board.findFirst.mockResolvedValue(null)
    const { deleteBoard } = await import('@/app/actions')
    const result = await deleteBoard('non-existent')
    expect(result.error).toBe('看板不存在或无权删除')
  })
})
describe('列功能', () => {
  beforeEach(() => { resetAllMocks() })
  it('createColumn 成功', async () => {
    mockPrisma.board.findFirst.mockResolvedValue({ id: 'b1', userId: 'user-1' })
    mockPrisma.column.aggregate.mockResolvedValue({ _max: { position: 0 } })
    mockPrisma.column.create.mockResolvedValue({ id: 'col-1', name: '新列', position: 1, boardId: 'b1' })
    const { createColumn } = await import('@/app/actions')
    const result = await createColumn({ name: '新列', boardId: 'b1' })
    expect(result.column).toBeDefined()
  })
})
describe('卡片功能', () => {
  beforeEach(() => { resetAllMocks() })
  it('createCard 成功', async () => {
    mockPrisma.column.findUnique.mockResolvedValue({ id: 'col-1', boardId: 'b1', board: { userId: 'user-1' } })
    mockPrisma.card.aggregate.mockResolvedValue({ _max: { position: 0 } })
    mockPrisma.card.create.mockResolvedValue({ id: 'card-1', title: '新卡片', columnId: 'col-1', position: 0 })
    const { createCard } = await import('@/app/actions')
    const result = await createCard({ title: '新卡片', columnId: 'col-1' })
    expect(result.card).toBeDefined()
    expect(result.card!.title).toBe('新卡片')
  })
})
describe('移动功能', () => {
  beforeEach(() => { resetAllMocks() })
  it('moveCard 成功', async () => {
    mockPrisma.card.findUnique.mockResolvedValue({ id: 'card-1', column: { board: { userId: 'user-1' } } })
    mockPrisma.column.findUnique.mockResolvedValue({ id: 'col-2', board: { userId: 'user-1' } })
    mockPrisma.card.update.mockResolvedValue({ id: 'card-1', columnId: 'col-2', position: 0 })
    const { moveCard } = await import('@/app/actions')
    const result = await moveCard('card-1', 'col-2', 0)
    expect(result.success).toBe(true)
  })
})
describe('子任务功能', () => {
  beforeEach(() => { resetAllMocks() })
  it('createSubtask 成功', async () => {
    mockPrisma.card.findUnique.mockResolvedValue({ id: 'card-1', column: { board: { userId: 'user-1' } } })
    mockPrisma.subtask.create.mockResolvedValue({ id: 'sub-1', title: '子任务', completed: false, cardId: 'card-1' })
    const { createSubtask } = await import('@/app/actions')
    const result = await createSubtask({ title: '子任务', cardId: 'card-1' })
    expect(result.subtask).toBeDefined()
    expect(result.subtask!.title).toBe('子任务')
  })
  it('updateSubtask 成功', async () => {
    mockPrisma.subtask.findUnique.mockResolvedValue({ id: 'sub-1', card: { column: { board: { userId: 'user-1' } } } })
    mockPrisma.subtask.update.mockResolvedValue({ id: 'sub-1', title: '子任务', completed: true })
    const { updateSubtask } = await import('@/app/actions')
    const result = await updateSubtask('sub-1', { completed: true })
    expect(result.subtask).toBeDefined()
    expect(result.subtask!.completed).toBe(true)
  })
  it('deleteSubtask 成功', async () => {
    mockPrisma.subtask.findUnique.mockResolvedValue({ id: 'sub-1', card: { column: { board: { userId: 'user-1' } } } })
    mockPrisma.subtask.delete.mockResolvedValue({ id: 'sub-1' })
    const { deleteSubtask } = await import('@/app/actions')
    const result = await deleteSubtask('sub-1')
    expect(result.success).toBe(true)
  })
})
describe('评论功能', () => {
  beforeEach(() => { resetAllMocks() })
  it('createComment 成功', async () => {
    mockPrisma.card.findUnique.mockResolvedValue({ id: 'card-1', column: { board: { userId: 'user-1' } } })
    mockPrisma.comment.create.mockResolvedValue({ id: 'com-1', content: '评论', cardId: 'card-1', userId: 'user-1', user: authUser, createdAt: new Date(), updatedAt: new Date() })
    const { createComment } = await import('@/app/actions')
    const result = await createComment({ content: '评论', cardId: 'card-1' })
    expect(result.comment).toBeDefined()
    expect(result.comment!.content).toBe('评论')
  })
  it('deleteComment 成功', async () => {
    mockPrisma.comment.findUnique.mockResolvedValue({ id: 'com-1', card: { column: { board: { userId: 'user-1' } } } })
    mockPrisma.comment.delete.mockResolvedValue({ id: 'com-1' })
    const { deleteComment } = await import('@/app/actions')
    const result = await deleteComment('com-1')
    expect(result.success).toBe(true)
  })
})
