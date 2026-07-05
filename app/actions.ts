'use server';

import { prisma } from '@/lib/prisma';
import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { hash, compare } from 'bcryptjs';

// ==================== 认证相关 ====================

export async function register(email: string, password: string, name?: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('该邮箱已被注册');
  }

  const hashedPassword = await hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
    },
  });

  return user;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('用户不存在');
  }

  const isValid = await compare(password, user.password);
  if (!isValid) {
    throw new Error('密码错误');
  }

  return user;
}

export async function logout() {
  await signOut({ redirect: false });
  redirect('/login');
}

// ==================== 看板相关 ====================

export async function getBoards() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  return prisma.board.findMany({
    where: { userId: session.user.id },
    include: {
      columns: {
        include: {
          cards: {
            include: {
              subtasks: true,
              comments: {
                include: { user: true },
                orderBy: { createdAt: 'desc' },
              },
            },
            orderBy: { position: 'asc' },
          },
        },
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getBoard(boardId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      columns: {
        include: {
          cards: {
            include: {
              subtasks: true,
              comments: {
                include: { user: true },
                orderBy: { createdAt: 'desc' },
              },
            },
            orderBy: { position: 'asc' },
          },
        },
        orderBy: { position: 'asc' },
      },
    },
  });

  if (!board || board.userId !== session.user.id) {
    throw new Error('看板不存在或无权限访问');
  }

  return board;
}

export async function createBoard(data: { name: string; description?: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  return prisma.board.create({
    data: {
      name: data.name,
      description: data.description,
      userId: session.user.id,
      columns: {
        create: [
          { name: '待办', position: 0 },
          { name: '进行中', position: 1 },
          { name: '已完成', position: 2 },
        ],
      },
    },
    include: {
      columns: true,
    },
  });
}

export async function updateBoard(boardId: string, data: { name?: string; description?: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board || board.userId !== session.user.id) {
    throw new Error('看板不存在或无权限访问');
  }

  return prisma.board.update({
    where: { id: boardId },
    data,
  });
}

export async function deleteBoard(boardId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board || board.userId !== session.user.id) {
    throw new Error('看板不存在或无权限访问');
  }

  return prisma.board.delete({ where: { id: boardId } });
}

// ==================== 列相关 ====================

export async function createColumn(data: { name: string; boardId: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  const maxPosition = await prisma.column.aggregate({
    where: { boardId: data.boardId },
    _max: { position: true },
  });

  return prisma.column.create({
    data: {
      name: data.name,
      boardId: data.boardId,
      position: (maxPosition._max.position ?? -1) + 1,
    },
  });
}

export async function updateColumn(columnId: string, data: { name?: string; position?: number }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  return prisma.column.update({
    where: { id: columnId },
    data,
  });
}

export async function deleteColumn(columnId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  return prisma.column.delete({ where: { id: columnId } });
}

export async function updateColumnsOrder(columns: { id: string; position: number }[]) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  const updates = columns.map((col) =>
    prisma.column.update({
      where: { id: col.id },
      data: { position: col.position },
    })
  );

  return prisma.$transaction(updates);
}

// ==================== 卡片相关 ====================

export async function createCard(data: { title: string; columnId: string; description?: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  const maxPosition = await prisma.card.aggregate({
    where: { columnId: data.columnId },
    _max: { position: true },
  });

  return prisma.card.create({
    data: {
      title: data.title,
      description: data.description,
      columnId: data.columnId,
      position: (maxPosition._max.position ?? -1) + 1,
    },
  });
}

export async function updateCard(cardId: string, data: { title?: string; description?: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  return prisma.card.update({
    where: { id: cardId },
    data,
  });
}

export async function deleteCard(cardId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  return prisma.card.delete({ where: { id: cardId } });
}

export async function moveCard(cardId: string, targetColumnId: string, position: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  return prisma.card.update({
    where: { id: cardId },
    data: {
      columnId: targetColumnId,
      position,
    },
  });
}

export async function updateCardsOrder(cards: { id: string; position: number; columnId: string }[]) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  const updates = cards.map((card) =>
    prisma.card.update({
      where: { id: card.id },
      data: {
        position: card.position,
        columnId: card.columnId,
      },
    })
  );

  return prisma.$transaction(updates);
}

// ==================== 子任务相关 ====================

export async function createSubtask(data: { title: string; cardId: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  return prisma.subtask.create({
    data: {
      title: data.title,
      cardId: data.cardId,
    },
  });
}

export async function updateSubtask(subtaskId: string, data: { title?: string; completed?: boolean }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  return prisma.subtask.update({
    where: { id: subtaskId },
    data,
  });
}

export async function deleteSubtask(subtaskId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  return prisma.subtask.delete({ where: { id: subtaskId } });
}

// ==================== 评论相关 ====================

export async function createComment(data: { content: string; cardId: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  return prisma.comment.create({
    data: {
      content: data.content,
      cardId: data.cardId,
      userId: session.user.id,
    },
  });
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== session.user.id) {
    throw new Error('评论不存在或无权限删除');
  }

  return prisma.comment.delete({ where: { id: commentId } });
}

// ==================== 用户相关 ====================

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  });
}

export async function exportData() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  const boards = await prisma.board.findMany({
    where: { userId: session.user.id },
    include: {
      columns: {
        include: {
          cards: {
            include: {
              subtasks: true,
              comments: true,
            },
          },
        },
      },
    },
  });

  return JSON.stringify(boards, null, 2);
}

export async function resetData() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('未登录');
  }

  // 删除用户所有看板（级联删除所有相关内容）
  await prisma.board.deleteMany({
    where: { userId: session.user.id },
  });
}
