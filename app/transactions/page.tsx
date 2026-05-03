import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/navbar';
import TransactionFilters from '@/components/transaction-filters';
import DeleteButton from '@/components/delete-button';
import { deleteTransaction } from '@/app/actions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; cat?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/');

  const params = await searchParams;
  const filterType = params.type || 'ALL';
  const filterCat = params.cat || 'ALL';

  const where: Record<string, unknown> = { userId: user.id };
  if (filterType !== 'ALL') where.type = filterType;
  if (filterCat !== 'ALL') where.categoryId = filterCat;

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' },
    }),
    prisma.category.findMany({ where: { userId: user.id } }),
  ]);

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + Number(t.amount), 0);

  return (
    <>
      <Navbar user={user} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">记账明细</h1>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
          >
            + 记一笔
          </Link>
        </div>
        <TransactionFilters filterType={filterType} filterCat={filterCat} categories={categories} />
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between">
            <span className="text-sm text-zinc-500">共 {transactions.length} 笔交易</span>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 font-medium">收: {formatCurrency(totalIncome)}</span>
              <span className="text-red-600 font-medium">支: {formatCurrency(totalExpense)}</span>
            </div>
          </div>
          <div className="divide-y divide-zinc-100">
            {transactions.length === 0 && (
              <div className="px-5 py-12 text-center text-zinc-400 text-sm">暂无符合条件的交易</div>
            )}
            {transactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              return (
                <div
                  key={tx.id}
                  className="px-5 py-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: tx.category?.color || '#999' }}
                    >
                      {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{tx.category?.name || '未知分类'}</p>
                      <p className="text-xs text-zinc-400">{formatDate(tx.date.toISOString())} {tx.note && `· ${tx.note}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                    </span>
                    <DeleteButton action={async () => { 'use server'; await deleteTransaction(tx.id); }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
