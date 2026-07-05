import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  })),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    board: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    column: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      aggregate: vi.fn(),
      updateMany: vi.fn(),
    },
    card: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      aggregate: vi.fn(),
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
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((args) => Promise.all(args)),
  },
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

describe('认证功能', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('邮箱已存在时抛出错误', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-1' } as any)
      const { register } = await import('@/app/actions')
      await expect(register('test@example.com', 'password123')).rejects.toThrow('该邮箱已被注册')
    })

    it('注册成功返回用户', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test' }
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any)
      const { register } = await import('@/app/actions')
      const result = await register('test@example.com', 'password123', 'Test')
      expect(result).toEqual(mockUser)
      expect(prisma.user.create).toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('用户不存在时抛出错误', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      const { login } = await import('@/app/actions')
      await expect(login('test@example.com', 'password')).rejects.toThrow('用户不存在')
    })
  })
})

describe('看板功能', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any)
  })

  describe('getBoards', () => {
    it('未登录时抛出错误', async () => {
      vi.mocked(auth).mockResolvedValue(null)
      const { getBoards } = await import('@/app/actions')
      await expect(getBoards()).rejects.toThrow('未登录')
    })

    it('返回用户的所有看板', async () => {
      const mockBoards = [{ id: 'board-1', name: '测试看板' }]
      vi.mocked(prisma.board.findMany).mockResolvedValue(mockBoards as any)
      const { getBoards } = await import('@/app/actions')
      const result = await getBoards()
      expect(result).toEqual(mockBoards)
    })
  })

  describe('createBoard', () => {
    it('未登录时抛出错误', async () => {
      vi.mocked(auth).mockResolvedValue(null)
      const { createBoard } = await import('@/app/actions')
      await expect(createBoard({ name: '测试看板' })).rejects.toThrow('未登录')
    })

    it('成功创建看板并返回', async () => {
      const mockBoard = { id: 'board-1', name: '测试看板', columns: [] }
      vi.mocked(prisma.board.create).mockResolvedValue(mockBoard as any)
      const { createBoard } = await import('@/app/actions')
      const result = await createBoard({ name: '测试看板' })
      expect(result).toEqual(mockBoard)
      expect(prisma.board.create).toHaveBeenCalledWith({
        data: {
          name: '测试看板',
          description: undefined,
          userId: 'user-1',
          columns: {
            create: [
              { name: '待办', position: 0 },
              { name: '进行中', position: 1 },
              { name: '已完成', position: 2 },
            ],
          },
        },
        include: { columns: true },
      })
    })
  })

  describe('deleteBoard', () => {
    it('看板不存在时抛出错误', async () => {
      vi.mocked(prisma.board.findUnique).mockResolvedValue(null)
      const { deleteBoard } = await import('@/app/actions')
      await expect(deleteBoard('board-1')).rejects.toThrow('看板不存在或无权限访问')
    })

    it('删除成功', async () => {
      vi.mocked(prisma.board.findUnique).mockResolvedValue({ id: 'board-1', userId: 'user-1' } as any)
      vi.mocked(prisma.board.delete).mockResolvedValue({} as any)
      const { deleteBoard } = await import('@/app/actions')
      await deleteBoard('board-1')
      expect(prisma.board.delete).toHaveBeenCalledWith({ where: { id: 'board-1' } })
    })
  })
})

describe('列功能', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any)
  })

  describe('createColumn', () => {
    it('成功创建列', async () => {
      vi.mocked(prisma.column.aggregate).mockResolvedValue({ _max: { position: 1 } } as any)
      vi.mocked(prisma.column.create).mockResolvedValue({ id: 'col-1', name: '新列' } as any)
      const { createColumn } = await import('@/app/actions')
      const result = await createColumn({ name: '新列', boardId: 'board-1' })
      expect(result.id).toBe('col-1')
    })
  })

  describe('deleteColumn', () => {
    it('成功删除列', async () => {
      vi.mocked(prisma.column.delete).mockResolvedValue({} as any)
      const { deleteColumn } = await import('@/app/actions')
      await deleteColumn('col-1')
      expect(prisma.column.delete).toHaveBeenCalledWith({ where: { id: 'col-1' } })
    })
  })
})

describe('卡片功能', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any)
  })

  describe('createCard', () => {
    it('成功创建卡片', async () => {
      vi.mocked(prisma.card.aggregate).mockResolvedValue({ _max: { position: 2 } } as any)
      vi.mocked(prisma.card.create).mockResolvedValue({ id: 'card-1', title: '新卡片' } as any)
      const { createCard } = await import('@/app/actions')
      const result = await createCard({ title: '新卡片', columnId: 'col-1' })
      expect(result.id).toBe('card-1')
    })
  })

  describe('moveCard', () => {
    it('成功移动卡片', async () => {
      vi.mocked(prisma.card.update).mockResolvedValue({} as any)
      const { moveCard } = await import('@/app/actions')
      await moveCard('card-1', 'col-2', 0)
      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: 'card-1' },
        data: { columnId: 'col-2', position: 0 },
      })
    })
  })

  describe('deleteCard', () => {
    it('成功删除卡片', async () => {
      vi.mocked(prisma.card.delete).mockResolvedValue({} as any)
      const { deleteCard } = await import('@/app/actions')
      await deleteCard('card-1')
      expect(prisma.card.delete).toHaveBeenCalledWith({ where: { id: 'card-1' } })
    })
  })
})

describe('子任务功能', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any)
  })

  describe('updateSubtask', () => {
    it('成功更新子任务', async () => {
      vi.mocked(prisma.subtask.update).mockResolvedValue({} as any)
      const { updateSubtask } = await import('@/app/actions')
      await updateSubtask('subtask-1', { completed: true })
      expect(prisma.subtask.update).toHaveBeenCalledWith({
        where: { id: 'subtask-1' },
        data: { completed: true },
      })
    })
  })
})

describe('评论功能', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any)
  })

  describe('createComment', () => {
    it('成功创建评论', async () => {
      vi.mocked(prisma.comment.create).mockResolvedValue({ id: 'comment-1' } as any)
      const { createComment } = await import('@/app/actions')
      const result = await createComment({ content: '新评论', cardId: 'card-1' })
      expect(result.id).toBe('comment-1')
    })
  })

  describe('deleteComment', () => {
    it('评论不存在时抛出错误', async () => {
      vi.mocked(prisma.comment.findUnique).mockResolvedValue(null)
      const { deleteComment } = await import('@/app/actions')
      await expect(deleteComment('comment-1')).rejects.toThrow('评论不存在或无权限删除')
    })

    it('成功删除自己的评论', async () => {
      vi.mocked(prisma.comment.findUnique).mockResolvedValue({ id: 'comment-1', userId: 'user-1' } as any)
      vi.mocked(prisma.comment.delete).mockResolvedValue({} as any)
      const { deleteComment } = await import('@/app/actions')
      await deleteComment('comment-1')
      expect(prisma.comment.delete).toHaveBeenCalledWith({ where: { id: 'comment-1' } })
    })
  })
})
