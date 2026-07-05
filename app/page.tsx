import { getUserFromCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/navbar';
import KanbanBoard from '@/components/kanban-board';

export default async function Home() {
  const user = await getUserFromCookie();
  if (!user) redirect('/login');

  const cards = await prisma.card.findMany({
    where: { userId: user.id },
    include: { subtasks: true, comments: { include: { user: true } } },
    orderBy: { position: 'asc' },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ id: user.id, name: user.name, email: user.email }} />
      <KanbanBoard initialCards={cards} />
    </div>
  );
}
