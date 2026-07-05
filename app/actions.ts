'use server';


import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// ==================== 认证相关 ====================

export async function register(email: string, password: string, name?: string) {
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: '该邮箱已被注册' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
      },
    });

    return { success: true, user: { id: user.id, email: user.email, name: user.name } };
  } catch (error) {
    return { error: '注册失败，请稍后重试' };
  }
}

export async function logout() {
  // NextAuth handles session via cookies
  // This function is called client-side to trigger logout
  return { success: true };
}

// ==================== 看板相关 ====================

// 验证用户是否拥有看板
async function verifyBoardOwnership(boardId: string, userId: string) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, userId },
  });
  return board;
}

export async function createBoard(data: { name: string; description?: string }) {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  try {
    const board = await prisma.board.create({
      data: {
        name: data.name,
        description: data.description,
        userId: session.id,
        columns: {
          create: [
            { name: '待办', position: 0 },
            { name: '进行中', position: 1 },
            { name: '测试', position: 2 },
            { name: '已完成', position: 3 },
          ],
        },
      },
      include: {
        columns: true,
      },
    });

    return { success: true, board };
  } catch (error) {
    return { error: '创建看板失败' };
  }
}

export async function updateBoard(boardId: string, data: { name?: string; description?: string }) {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  const board = await verifyBoardOwnership(boardId, session.id);
  if (!board) {
    return { error: '看板不存在或无权修改' };
  }

  try {
    const updated = await prisma.board.update({
      where: { id: boardId },
      data,
    });
    return { success: true, board: updated };
  } catch (error) {
    return { error: '更新看板失败' };
  }
}

export async function deleteBoard(boardId: string) {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  const board = await verifyBoardOwnership(boardId, session.id);
  if (!board) {
    return { error: '看板不存在或无权删除' };
  }

  try {
    await prisma.board.delete({ where: { id: boardId } });
    return { success: true };
  } catch (error) {
    return { error: '删除看板失败' };
  }
}

export async function getUserBoards() {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  try {
    const boards = await prisma.board.findMany({
      where: { userId: session.id },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              include: {
                subtasks: true,
                comments: {
                  include: { user: true },
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return { success: true, boards };
  } catch (error) {
    return { error: '获取看板列表失败' };
  }
}

// ==================== 列相关 ====================

export async function createColumn(data: { name: string; boardId: string }) {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  const board = await verifyBoardOwnership(data.boardId, session.id);
  if (!board) {
    return { error: '看板不存在或无权操作' };
  }

  try {
    const maxPosition = await prisma.column.aggregate({
      where: { boardId: data.boardId },
      _max: { position: true },
    });

    const column = await prisma.column.create({
      data: {
        name: data.name,
        boardId: data.boardId,
        position: (maxPosition._max.position || 0) + 1,
      },
    });
    return { success: true, column };
  } catch (error) {
    return { error: '创建列失败' };
  }
}

export async function updateColumn(columnId: string, data: { name?: string }) {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  // 查找列所属的看板
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: { board: true },
  });

  if (!column || column.board.userId !== session.id) {
    return { error: '列不存在或无权操作' };
  }

  try {
    const updated = await prisma.column.update({
      where: { id: columnId },
      data,
    });
    return { success: true, column: updated };
  } catch (error) {
    return { error: '更新列失败' };
  }
}

export async function deleteColumn(columnId: string) {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: { board: true },
  });

  if (!column || column.board.userId !== session.id) {
    return { error: '列不存在或无权操作' };
  }

  try {
    await prisma.column.delete({ where: { id: columnId } });
    return { success: true };
  } catch (error) {
    return { error: '删除列失败' };
  }
}

// ==================== 卡片相关 ====================

export async function createCard(data: { title: string; columnId: string; description?: string }) {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  // 验证列所属看板的所有权
  const column = await prisma.column.findUnique({
    where: { id: data.columnId },
    include: { board: true },
  });

  if (!column || column.board.userId !== session.id) {
    return { error: '列不存在或无权操作' };
  }

  try {
    const maxPosition = await prisma.card.aggregate({
      where: { columnId: data.columnId },
      _max: { position: true },
    });

    const card = await prisma.card.create({
      data: {
        title: data.title,
        description: data.description,
        columnId: data.columnId,
        position: (maxPosition._max.position || 0) + 1,
      },
    });
    return { success: true, card };
  } catch (error) {
    return { error: '创建卡片失败' };
  }
}

export async function updateCard(cardId: string, data: { title?: string; description?: string; priority?: string }) {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { column: { include: { board: true } } },
  });

  if (!card || card.column.board.userId !== session.id) {
    return { error: '卡片不存在或无权操作' };
  }

  try {
    const updated = await prisma.card.update({
      where: { id: cardId },
      data,
    });
    return { success: true, card: updated };
  } catch (error) {
    return { error: '更新卡片失败' };
  }
}

export async function deleteCard(cardId: string) {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { column: { include: { board: true } } },
  });

  if (!card || card.column.board.userId !== session.id) {
    return { error: '卡片不存在或无权操作' };
  }

  try {
    await prisma.card.delete({ where: { id: cardId } });
    return { success: true };
  } catch (error) {
    return { error: '删除卡片失败' };
  }
}

export async function moveCard(cardId: string, targetColumnId: string, position: number) {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  // 验证卡片所属看板的所有权
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { column: { include: { board: true } } },
  });

  if (!card || card.column.board.userId !== session.id) {
    return { error: '卡片不存在或无权操作' };
  }

  // 验证目标列所属看板的所有权（同一看板内移动）
  const targetColumn = await prisma.column.findUnique({
    where: { id: targetColumnId },
    include: { board: true },
  });

  if (!targetColumn || targetColumn.board.userId !== session.id) {
    return { error: '目标列不存在或无权操作' };
  }

  try {
    const updated = await prisma.card.update({
      where: { id: cardId },
      data: {
        columnId: targetColumnId,
        position,
      },
    });
    return { success: true, card: updated };
  } catch (error) {
    return { error: '移动卡片失败' };
  }
}

export async function updateCardsOrder(cards: { id: string; position: number; columnId: string }[]) {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  try {
    // 使用事务批量更新
    await prisma.$transaction(
      cards.map((card) =>
        prisma.card.update({
          where: { id: card.id },
          data: { position: card.position, columnId: card.columnId },
        })
      )
    );
    return { success: true };
  } catch (error) {
    return { error: '更新卡片顺序失败' };
  }
}

export async function updateColumnsOrder(columns: { id: string; position: number }[]) {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  try {
    await prisma.$transaction(
      columns.map((col) =>
        prisma.column.update({
          where: { id: col.id },
          data: { position: col.position },
        })
      )
    );
    return { success: true };
  } catch (error) {
    return { error: '更新列顺序失败' };
  }
}

// ==================== 子任务相关 ====================

export async function createSubtask(data: { title: string; cardId: string }) {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  const card = await prisma.card.findUnique({
    where: { id: data.cardId },
    include: { column: { include: { board: true } } },
  });

  if (!card || card.column.board.userId !== session.id) {
    return { error: '卡片不存在或无权操作' };
  }

  try {
    const subtask = await prisma.subtask.create({
      data: {
        title: data.title,
        cardId: data.cardId,
      },
    });
    return { success: true, subtask };
  } catch (error) {
    return { error: '创建子任务失败' };
  }
}

export async function updateSubtask(subtaskId: string, data: { title?: string; completed?: boolean }) {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  const subtask = await prisma.subtask.findUnique({
    where: { id: subtaskId },
    include: { card: { include: { column: { include: { board: true } } } } },
  });

  if (!subtask || subtask.card.column.board.userId !== session.id) {
    return { error: '子任务不存在或无权操作' };
  }

  try {
    const updated = await prisma.subtask.update({
      where: { id: subtaskId },
      data,
    });
    return { success: true, subtask: updated };
  } catch (error) {
    return { error: '更新子任务失败' };
  }
}

export async function deleteSubtask(subtaskId: string) {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  const subtask = await prisma.subtask.findUnique({
    where: { id: subtaskId },
    include: { card: { include: { column: { include: { board: true } } } } },
  });

  if (!subtask || subtask.card.column.board.userId !== session.id) {
    return { error: '子任务不存在或无权操作' };
  }

  try {
    await prisma.subtask.delete({ where: { id: subtaskId } });
    return { success: true };
  } catch (error) {
    return { error: '删除子任务失败' };
  }
}

// ==================== 评论相关 ====================

export async function createComment(data: { content: string; cardId: string }) {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  const card = await prisma.card.findUnique({
    where: { id: data.cardId },
    include: { column: { include: { board: true } } },
  });

  if (!card || card.column.board.userId !== session.id) {
    return { error: '卡片不存在或无权操作' };
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        cardId: data.cardId,
        userId: session.id,
      },
      include: { user: true },
    });
    return { success: true, comment };
  } catch (error) {
    return { error: '创建评论失败' };
  }
}

export async function deleteComment(commentId: string) {
  const session = await getCurrentUser();
  if (!session?.id) {
    return { error: '请先登录' };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { card: { include: { column: { include: { board: true } } } } },
  });

  if (!comment || comment.card.column.board.userId !== session.id) {
    return { error: '评论不存在或无权操作' };
  }

  try {
    await prisma.comment.delete({ where: { id: commentId } });
    return { success: true };
  } catch (error) {
    return { error: '删除评论失败' };
  }
}
