import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { KanbanBoard } from '@/components/kanban-board';

interface BoardPageProps {
  params: { id: string };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/');
  }

  const board = await prisma.board.findUnique({
    where: { 
      id: params.id,
      userId: session.user.id,
    },
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
  });

  if (!board) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
          {board.description && (
            <p className="mt-2 text-gray-600">{board.description}</p>
          )}
        </div>
        
        <KanbanBoard board={board} />
      </div>
    </div>
  );
}
