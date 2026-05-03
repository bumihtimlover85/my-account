'use client';
import { useRouter } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { Category } from '@prisma/client';

interface Props {
  filterType: string;
  filterCat: string;
  categories: Category[];
}

export default function TransactionFilters({ filterType, filterCat, categories }: Props) {
  const router = useRouter();

  function update(type: string, cat: string) {
    const sp = new URLSearchParams();
    if (type !== 'ALL') sp.set('type', type);
    if (cat !== 'ALL') sp.set('cat', cat);
    const q = sp.toString();
    router.push('/transactions' + (q ? `?${q}` : ''));
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Filter className="w-4 h-4" />
        筛选:
      </div>
      <div className="flex gap-2">
        {(['ALL', 'INCOME', 'EXPENSE'] as const).map((t) => (
          <button
            key={t}
            onClick={() => update(t, filterCat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterType === t
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {t === 'ALL' ? '全部' : t === 'INCOME' ? '收入' : '支出'}
          </button>
        ))}
      </div>
      <select
        value={filterCat}
        onChange={(e) => update(filterType, e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-zinc-300 text-sm text-zinc-700 focus:outline-none focus:border-blue-500 bg-white"
      >
        <option value="ALL">全部分类</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      {(filterType !== 'ALL' || filterCat !== 'ALL') && (
        <button
          onClick={() => update('ALL', 'ALL')}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer"
        >
          <X className="w-3 h-3" /> 清除
        </button>
      )}
    </div>
  );
}
