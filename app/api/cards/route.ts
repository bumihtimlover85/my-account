import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }
    const cards = await prisma.card.findMany({
      where: { userId: user.id },
      include: { subtasks: true, comments: { include: { user: true } } },
      orderBy: { position: 'asc' },
    });
    return NextResponse.json(cards);
  } catch (error) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }
    const { id, status, position } = await request.json();
    await prisma.card.updateMany({
      where: { id, userId: user.id },
      data: { status, position },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}
