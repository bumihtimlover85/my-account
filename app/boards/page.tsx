import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BoardList } from '@/components/board-list';

export default async function BoardsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/');
  }

  const boards = await prisma.board.findMany({
    where: { userId: session.user.id },
    include: {
      columns: {
        include: {
          cards: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">我的看板</h1>
          <p className="mt-2 text-gray-600">管理你的项目和任务</p>
        </div>
        
        <BoardList boards={boards} />
      </div>
    </div>
  );
}
