'use client';

import { useState, useEffect } from 'react';
import { getStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';

export default function StatsCards() {
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0, month: '' });

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const monthStr = now.toISOString().slice(0, 7);
      const { transactions } = getStore().getData();
      const monthTxs = transactions.filter((t) => t.date.startsWith(monthStr));
      const income = monthTxs.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
      const expense = monthTxs.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
      setStats({
        income,
        expense,
        balance: income - expense,
        month: now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }),
      });
    };
    calc();
    return getStore().subscribe(calc);
  }, []);

  const cards = [
    { label: '本月收入', value: stats.income, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: '本月支出', value: stats.expense, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    { label: '本月结余', value: stats.balance, icon: Wallet, color: stats.balance >= 0 ? 'text-blue-600' : 'text-red-600', bg: stats.balance >= 0 ? 'bg-blue-50' : 'bg-red-50' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="sm:col-span-3 flex items-center gap-2 text-zinc-500 text-sm mb-1">
        <Calendar className="w-4 h-4" />
        {stats.month}
      </div>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-500 font-medium">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold tracking-tight ${card.color}`}>{formatCurrency(card.value)}</p>
          </div>
        );
      })}
    </div>
  );
}
