'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, setAuthCookie, clearAuthCookie, getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

// ── Auth ──

export async function register(data: { name: string; email: string; password: string }) {
  const { name, email, password } = data;
  if (!name?.trim() || !email?.trim() || !password) throw new Error('请填写完整信息');
  if (password.length < 6) throw new Error('密码至少 6 位');

  const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (existing) throw new Error('邮箱已被注册');

  const hash = bcrypt.hashSync(password, 10);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: email.trim(), password: hash },
  });

  await prisma.category.createMany({
    data: [
      { userId: user.id, name: '工资', type: 'INCOME', icon: 'wallet', color: '#16A34A' },
      { userId: user.id, name: '奖金', type: 'INCOME', icon: 'gift', color: '#2563EB' },
      { userId: user.id, name: '投资', type: 'INCOME', icon: 'trending-up', color: '#7C3AED' },
      { userId: user.id, name: '餐饮', type: 'EXPENSE', icon: 'utensils', color: '#DC2626' },
      { userId: user.id, name: '交通', type: 'EXPENSE', icon: 'bus', color: '#EA580C' },
      { userId: user.id, name: '购物', type: 'EXPENSE', icon: 'shopping-bag', color: '#DB2777' },
      { userId: user.id, name: '娱乐', type: 'EXPENSE', icon: 'gamepad-2', color: '#9333EA' },
      { userId: user.id, name: '住房', type: 'EXPENSE', icon: 'home', color: '#0D9488' },
      { userId: user.id, name: '医疗', type: 'EXPENSE', icon: 'heart-pulse', color: '#E11D48' },
      { userId: user.id, name: '教育', type: 'EXPENSE', icon: 'book-open', color: '#0284C7' },
    ],
  });

  const token = signToken(user.id);
  await setAuthCookie(token);
  redirect('/dashboard');
}

export async function login(data: { email: string; password: string }) {
  const { email, password } = data;
  if (!email?.trim() || !password) throw new Error('请填写完整信息');

  const user = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (!user) throw new Error('邮箱或密码错误');

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) throw new Error('邮箱或密码错误');

  const token = signToken(user.id);
  await setAuthCookie(token);
  redirect('/dashboard');
}

export async function logout() {
  await clearAuthCookie();
  redirect('/');
}

// ── Transactions ──

export async function createTransaction(data: {
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  date: string;
  note: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('未登录');

  const { amount, type, categoryId, date, note } = data;
  if (!amount || amount <= 0) throw new Error('请输入有效金额');
  if (!categoryId) throw new Error('请选择分类');

  await prisma.transaction.create({
    data: {
      userId: user.id,
      amount,
      type,
      categoryId,
      date: new Date(date),
      note: note?.trim() || null,
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
}

export async function deleteTransaction(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('未登录');

  await prisma.transaction.deleteMany({ where: { id, userId: user.id } });

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
}

// ── Categories ──

export async function createCategory(data: {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
  icon?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('未登录');

  const { name, type, color, icon } = data;
  if (!name?.trim()) throw new Error('请输入分类名称');

  await prisma.category.create({
    data: {
      userId: user.id,
      name: name.trim(),
      type,
      color,
      icon: icon || 'circle',
    },
  });

  revalidatePath('/categories');
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
}

export async function deleteCategory(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('未登录');

  await prisma.category.deleteMany({ where: { id, userId: user.id } });

  revalidatePath('/categories');
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
}

// ── Settings ──

export async function exportUserData() {
  const user = await getCurrentUser();
  if (!user) throw new Error('未登录');

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' } }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } }),
  ]);

  return { user: { name: user.name, email: user.email }, transactions, categories };
}

export async function resetUserData() {
  const user = await getCurrentUser();
  if (!user) throw new Error('未登录');

  await prisma.$transaction([
    prisma.transaction.deleteMany({ where: { userId: user.id } }),
    prisma.category.deleteMany({ where: { userId: user.id } }),
  ]);

  await prisma.category.createMany({
    data: [
      { userId: user.id, name: '工资', type: 'INCOME', icon: 'wallet', color: '#16A34A' },
      { userId: user.id, name: '奖金', type: 'INCOME', icon: 'gift', color: '#2563EB' },
      { userId: user.id, name: '投资', type: 'INCOME', icon: 'trending-up', color: '#7C3AED' },
      { userId: user.id, name: '餐饮', type: 'EXPENSE', icon: 'utensils', color: '#DC2626' },
      { userId: user.id, name: '交通', type: 'EXPENSE', icon: 'bus', color: '#EA580C' },
      { userId: user.id, name: '购物', type: 'EXPENSE', icon: 'shopping-bag', color: '#DB2777' },
      { userId: user.id, name: '娱乐', type: 'EXPENSE', icon: 'gamepad-2', color: '#9333EA' },
      { userId: user.id, name: '住房', type: 'EXPENSE', icon: 'home', color: '#0D9488' },
      { userId: user.id, name: '医疗', type: 'EXPENSE', icon: 'heart-pulse', color: '#E11D48' },
      { userId: user.id, name: '教育', type: 'EXPENSE', icon: 'book-open', color: '#0284C7' },
    ],
  });

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/categories');
  revalidatePath('/settings');
}
