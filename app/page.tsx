import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/navbar';
import KanbanBoard from '@/components/kanban-board';
import { Project } from '@/types';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { project: projectParam } = await searchParams;

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  });

  // 如果没有项目，显示空状态
  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-surface-muted transition-colors duration-500">
        <Navbar user={{ id: user.id, name: user.name, email: user.email }} projects={[]} currentProjectId={null}  />
        <main className="flex items-center justify-center h-[calc(100vh-100px)]">
          <EmptyState />
        </main>
      </div>
    );
  }

  // 确定当前项目
  let currentProject = projectParam
    ? projects.find(p => p.id === projectParam)
    : null;
  if (!currentProject) {
    currentProject = projects[0];
  }

  const cards = await prisma.card.findMany({
    where: { userId: user.id, projectId: currentProject.id },
    include: { subtasks: true, comments: { include: { user: true } } },
    orderBy: { position: 'asc' },
  });

  return (
    <div className="min-h-screen bg-surface-muted transition-colors duration-500">
      <Navbar
        user={{ id: user.id, name: user.name, email: user.email }}
        projects={projects.map(p => ({ id: p.id, name: p.name, userId: p.userId, createdAt: p.createdAt, updatedAt: p.updatedAt }))}
        currentProjectId={currentProject.id}
        
      />
      <main>
        <KanbanBoard initialCards={cards} currentProjectId={currentProject.id} />
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center animate-fade-in">
      <div className="
        w-20 h-20 mx-auto mb-6
        bg-gradient-to-br from-brand-100 to-brand-200
        dark:from-brand-500/10 dark:to-brand-500/5
        rounded-3xl flex items-center justify-center
        shadow-soft
      ">
        <svg className="w-10 h-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-text-primary mb-2">欢迎使用项目看板</h2>
      <p className="text-text-tertiary text-sm mb-8 max-w-sm">
        点击左上角的「选择项目」下拉菜单，创建一个新项目开始管理你的任务吧
      </p>
    </div>
  );
}
