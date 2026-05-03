import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/navbar';
import StatsCards from '@/components/stats-cards';
import CategoryChart from '@/components/category-chart';
import RecentTransactions from '@/components/recent-transactions';
import TransactionForm from '@/components/transaction-form';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/');

  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: user.id, date: { gte: start, lte: end } },
      include: { category: true },
      orderBy: { date: 'desc' },
    }),
    prisma.category.findMany({ where: { userId: user.id } }),
  ]);

  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + Number(t.amount), 0);

  return (
    <>
      <Navbar user={user} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">仪表盘</h1>
        </div>
        <StatsCards income={income} expense={expense} month={format(now, 'yyyy年M月')} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TransactionForm categories={categories} />
          </div>
          <div>
            <CategoryChart transactions={transactions} categories={categories} />
          </div>
        </div>
        <RecentTransactions transactions={transactions.slice(0, 5)} />
      </main>
    </>
  );
}
