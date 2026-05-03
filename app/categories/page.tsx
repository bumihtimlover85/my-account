import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/navbar';
import CategoryForm from '@/components/category-form';
import DeleteButton from '@/components/delete-button';
import { deleteCategory } from '@/app/actions';

export default async function CategoriesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/');

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  });

  const incomeCats = categories.filter((c) => c.type === 'INCOME');
  const expenseCats = categories.filter((c) => c.type === 'EXPENSE');

  return (
    <>
      <Navbar user={user} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">分类管理</h1>
        </div>
        <CategoryForm />
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm space-y-6">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-green-700">收入分类</h2>
            <div className="flex flex-wrap gap-2">
              {incomeCats.map((cat) => (
                <div
                  key={cat.id}
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors"
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm text-zinc-700">{cat.name}</span>
                  <DeleteButton action={async () => { 'use server'; await deleteCategory(cat.id); }} />
                </div>
              ))}
              {incomeCats.length === 0 && <p className="text-sm text-zinc-400">暂无收入分类</p>}
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-red-700">支出分类</h2>
            <div className="flex flex-wrap gap-2">
              {expenseCats.map((cat) => (
                <div
                  key={cat.id}
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors"
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm text-zinc-700">{cat.name}</span>
                  <DeleteButton action={async () => { 'use server'; await deleteCategory(cat.id); }} />
                </div>
              ))}
              {expenseCats.length === 0 && <p className="text-sm text-zinc-400">暂无支出分类</p>}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
