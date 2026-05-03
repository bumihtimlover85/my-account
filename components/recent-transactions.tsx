import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction, Category } from '@prisma/client';

interface Props {
  transactions: (Transaction & { category: Category })[];
}

export default function RecentTransactions({ transactions }: Props) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-zinc-900">最近交易</h3>
        <a href="/transactions" className="text-xs text-blue-600 hover:text-blue-700 font-medium">查看全部 →</a>
      </div>
      <div className="space-y-3">
        {transactions.length === 0 && (
          <p className="text-sm text-zinc-400 py-6 text-center">暂无交易记录</p>
        )}
        {transactions.map((tx) => {
          const isIncome = tx.type === 'INCOME';
          return (
            <div key={tx.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: tx.category?.color || '#999' }}
                >
                  {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{tx.category?.name || '未知分类'}</p>
                  <p className="text-xs text-zinc-400">{formatDate(tx.date.toISOString())} {tx.note && `· ${tx.note}`}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                {isIncome ? '+' : '-'}{formatCurrency(Number(tx.amount))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
