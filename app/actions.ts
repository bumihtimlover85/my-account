'use server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, signToken, setAuthCookie, clearAuthCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

const VALID_STATUSES = ['todo', 'in_progress', 'testing', 'done'] as const;
const VALID_PRIORITIES = ['high', 'medium', 'low'] as const;

// Auth actions
export async function register(name: string, email: string, password: string) {
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: '邮箱已被注册' };
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    const token = signToken(user.id);
    await setAuthCookie(token);
    return { success: true };
  } catch (error) {
    return { error: '注册失败，请重试' };
  }
}

export async function login(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: '邮箱或密码错误' };
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return { error: '邮箱或密码错误' };
    const token = signToken(user.id);
    await setAuthCookie(token);
    return { success: true };
  } catch (error) {
    return { error: '登录失败，请重试' };
  }
}

export async function logout() {
  await clearAuthCookie();
}

// Card actions
export async function createCard(data: { title: string; description?: string; priority: string; status: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('未登录');
  
  if (!VALID_STATUSES.includes(data.status as any)) {
    throw new Error('无效的状态值');
  }
  if (!VALID_PRIORITIES.includes(data.priority as any)) {
    throw new Error('无效的优先级值');
  }
  
  const maxPosition = await prisma.card.aggregate({
    where: { userId: user.id, status: data.status },
    _max: { position: true },
  });
  await prisma.card.create({
    data: {
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      status: data.status,
      position: (maxPosition._max.position ?? -1) + 1,
      userId: user.id,
    },
  });
  revalidatePath('/');
}

export async function updateCard(id: string, data: { title?: string; description?: string; priority?: string; status?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('未登录');
  
  if (data.status && !VALID_STATUSES.includes(data.status as any)) {
    throw new Error('无效的状态值');
  }
  if (data.priority && !VALID_PRIORITIES.includes(data.priority as any)) {
    throw new Error('无效的优先级值');
  }
  
  await prisma.card.updateMany({
    where: { id, userId: user.id },
    data,
  });
  revalidatePath('/');
}

export async function deleteCard(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('未登录');
  await prisma.card.deleteMany({ where: { id, userId: user.id } });
  revalidatePath('/');
}

export async function moveCard(id: string, status: string, position: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error('未登录');
  
  if (!VALID_STATUSES.includes(status as any)) {
    throw new Error('无效的状态值');
  }
  
  await prisma.card.updateMany({
    where: { id, userId: user.id },
    data: { status, position },
  });
  revalidatePath('/');
}

// Subtask actions
export async function addSubtask(cardId: string, title: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('未登录');
  const card = await prisma.card.findFirst({ where: { id: cardId, userId: user.id } });
  if (!card) throw new Error('卡片不存在');
  await prisma.subtask.create({ data: { title, cardId } });
  revalidatePath('/');
}

export async function toggleSubtask(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('未登录');
  
  const subtask = await prisma.subtask.findUnique({
    where: { id },
    include: { card: true },
  });
  if (!subtask) throw new Error('子任务不存在');
  if (subtask.card.userId !== user.id) throw new Error('无权操作');
  
  await prisma.subtask.update({
    where: { id },
    data: { completed: !subtask.completed },
  });
  revalidatePath('/');
}

// Comment actions
export async function addComment(cardId: string, content: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('未登录');
  await prisma.comment.create({
    data: { content, cardId, userId: user.id },
  });
  revalidatePath('/');
}
