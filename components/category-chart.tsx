'use client';

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStore } from '@/hooks/useStore';

interface ChartItem {
  name: string;
  value: number;
  color: string;
}

export default function CategoryChart() {
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const { transactions, categories } = useStore();

  const data: ChartItem[] = useMemo(() => {
    const now = new Date();
    const monthStr = now.toISOString().slice(0, 7);
    const monthTxs = transactions.filter((t) => t.date.startsWith(monthStr) && t.type === type);
    const map = new Map<string, number>();
    monthTxs.forEach((t) => {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
    });
    return Array.from(map.entries())
      .map(([catId, value]) => {
        const cat = categories.find((c) => c.id === catId);
        return { name: cat?.name || '未知', value, color: cat?.color || '#999' };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories, type]);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-zinc-900">分类占比</h3>
        <div className="flex rounded-lg bg-zinc-100 p-0.5">
          {(['EXPENSE', 'INCOME'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                type === t ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {t === 'EXPENSE' ? '支出' : '收入'}
            </button>
          ))}
        </div>
      </div>
      {data.length > 0 ? (
        <div className="h-64" role="img" aria-label={`${type === 'EXPENSE' ? '支出' : '收入'}分类占比图表`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`¥${value.toFixed(2)}`, '金额']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '12px' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-zinc-400 text-sm">
          本月暂无{type === 'EXPENSE' ? '支出' : '收入'}记录
        </div>
      )}
    </div>
  );
}
