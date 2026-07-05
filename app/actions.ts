'use server';

import { prisma } from '@/lib/prisma';
import { getUserFromCookie, setTokenCookie, removeTokenCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

// Auth actions
export async function register(name: string, email: string, password: string) {
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: '邮箱已被注册' };

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    await setTokenCookie({ id: user.id, email: user.email, name: user.name });
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

    await setTokenCookie({ id: user.id, email: user.email, name: user.name });
    return { success: true };
  } catch (error) {
    return { error: '登录失败，请重试' };
  }
}

export async function logout() {
  await removeTokenCookie();
}

// Card actions
export async function createCard(data: { title: string; description?: string; priority: string; status: string }) {
  const user = await getUserFromCookie();
  if (!user) throw new Error('未登录');

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
  const user = await getUserFromCookie();
  if (!user) throw new Error('未登录');

  await prisma.card.updateMany({
    where: { id, userId: user.id },
    data,
  });

  revalidatePath('/');
}

export async function deleteCard(id: string) {
  const user = await getUserFromCookie();
  if (!user) throw new Error('未登录');

  await prisma.card.deleteMany({ where: { id, userId: user.id } });
  revalidatePath('/');
}

export async function moveCard(id: string, status: string, position: number) {
  const user = await getUserFromCookie();
  if (!user) throw new Error('未登录');

  await prisma.card.updateMany({
    where: { id, userId: user.id },
    data: { status, position },
  });
}

// Subtask actions
export async function addSubtask(cardId: string, title: string) {
  const user = await getUserFromCookie();
  if (!user) throw new Error('未登录');

  const card = await prisma.card.findFirst({ where: { id: cardId, userId: user.id } });
  if (!card) throw new Error('卡片不存在');

  await prisma.subtask.create({ data: { title, cardId } });
  revalidatePath('/');
}

export async function toggleSubtask(id: string) {
  const subtask = await prisma.subtask.findUnique({ where: { id } });
  if (!subtask) throw new Error('子任务不存在');

  await prisma.subtask.update({
    where: { id },
    data: { completed: !subtask.completed },
  });
  revalidatePath('/');
}

// Comment actions
export async function addComment(cardId: string, content: string) {
  const user = await getUserFromCookie();
  if (!user) throw new Error('未登录');

  await prisma.comment.create({
    data: { content, cardId, userId: user.id },
  });
  revalidatePath('/');
}
