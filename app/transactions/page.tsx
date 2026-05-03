'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { getStore } from '@/lib/store';
import { Transaction, TransactionType } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import Navbar from '@/components/navbar';
import TransactionForm from '@/components/transaction-form';
import { ArrowUpRight, ArrowDownRight, Trash2, Filter, X } from 'lucide-react';

export default function TransactionsPage() {
  const router = useRouter();
  const { transactions, categories, user } = useStore();
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [filterCat, setFilterCat] = useState<string>('ALL');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user, router]);

  const txs: Transaction[] = useMemo(() => {
    let list = [...transactions];
    if (filterType !== 'ALL') list = list.filter((t) => t.type === filterType);
    if (filterCat !== 'ALL') list = list.filter((t) => t.categoryId === filterCat);
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, filterCat]);

  const totalIncome = txs.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const totalExpense = txs.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">记账明细</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {showForm ? '关闭' : '+ 记一笔'}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Filter className="w-4 h-4" />
            筛选:
          </div>
          <select
            id="filter-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TransactionType | 'ALL')}
            className="px-3 py-1.5 rounded-lg border border-zinc-300 text-sm text-zinc-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">全部类型</option>
            <option value="INCOME">收入</option>
            <option value="EXPENSE">支出</option>
          </select>
          <select
            id="filter-cat"
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-zinc-300 text-sm text-zinc-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">全部分类</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {(filterType !== 'ALL' || filterCat !== 'ALL') && (
            <button
              onClick={() => { setFilterType('ALL'); setFilterCat('ALL'); }}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer"
            >
              <X className="w-3 h-3" /> 清除
            </button>
          )}
        </div>
        {showForm && <TransactionForm onSuccess={() => setShowForm(false)} />}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between">
            <span className="text-sm text-zinc-500">共 {txs.length} 笔交易</span>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 font-medium">收: {formatCurrency(totalIncome)}</span>
              <span className="text-red-600 font-medium">支: {formatCurrency(totalExpense)}</span>
            </div>
          </div>
          <div className="divide-y divide-zinc-100">
            {txs.length === 0 && (
              <div className="px-5 py-12 text-center text-zinc-400 text-sm">暂无符合条件的交易</div>
            )}
            {txs.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const isIncome = tx.type === 'INCOME';
              return (
                <div key={tx.id} className="px-5 py-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: cat?.color || '#999' }}
                    >
                      {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{cat?.name || '未知分类'}</p>
                      <p className="text-xs text-zinc-400">{formatDate(tx.date)} {tx.note && `· ${tx.note}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                    <button
                      onClick={() => getStore().deleteTransaction(tx.id)}
                      className="p-1.5 rounded-md text-zinc-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      aria-label="删除交易"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
