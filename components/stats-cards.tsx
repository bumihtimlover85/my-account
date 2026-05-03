import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';

interface Props {
  income: number;
  expense: number;
  month: string;
}

export default function StatsCards({ income, expense, month }: Props) {
  const balance = income - expense;
  const cards = [
    { label: '本月收入', value: income, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: '本月支出', value: expense, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    { label: '本月结余', value: balance, icon: Wallet, color: balance >= 0 ? 'text-blue-600' : 'text-red-600', bg: balance >= 0 ? 'bg-blue-50' : 'bg-red-50' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="sm:col-span-3 flex items-center gap-2 text-zinc-500 text-sm mb-1">
        <Calendar className="w-4 h-4" />
        {month}
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
