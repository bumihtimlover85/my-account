'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { getStore } from '@/lib/store';
import { TransactionType } from '@/types';
import Navbar from '@/components/navbar';
import { Plus, Trash2 } from 'lucide-react';

const PRESET_COLORS = [
  '#DC2626', '#EA580C', '#D97706', '#65A30D', '#16A34A',
  '#059669', '#0D9488', '#0891B2', '#0284C7', '#2563EB',
  '#4F46E5', '#7C3AED', '#9333EA', '#C026D3', '#DB2777',
  '#E11D48', '#71717A',
];

export default function CategoriesPage() {
  const router = useRouter();
  const { categories, user } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user, router]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    getStore().addCategory({ name: name.trim(), type, color, icon: 'circle' });
    setName('');
    setShowAdd(false);
  };

  const incomeCats = categories.filter((c) => c.type === 'INCOME');
  const expenseCats = categories.filter((c) => c.type === 'EXPENSE');

  const renderGroup = (title: string, list: typeof categories, accent: string) => (
    <div className="space-y-3">
      <h2 className={`text-sm font-semibold ${accent}`}>{title}</h2>
      <div className="flex flex-wrap gap-2">
        {list.map((cat) => (
          <div
            key={cat.id}
            className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors"
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
            <span className="text-sm text-zinc-700">{cat.name}</span>
            <button
              onClick={() => getStore().deleteCategory(cat.id)}
              className="p-0.5 rounded text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              aria-label={`删除分类 ${cat.name}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">分类管理</h1>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            新建分类
          </button>
        </div>
        {showAdd && (
          <form onSubmit={handleAdd} className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${type === 'EXPENSE' ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-zinc-50 text-zinc-500'}`}
              >支出</button>
              <button
                type="button"
                onClick={() => setType('INCOME')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${type === 'INCOME' ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-zinc-50 text-zinc-500'}`}
              >收入</button>
            </div>
            <div>
              <label htmlFor="cat-name" className="block text-sm font-medium text-zinc-700 mb-1.5">分类名称</label>
              <input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：餐饮、交通"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">颜色</label>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="选择颜色">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={color === c}
                    aria-label={`颜色 ${c}`}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-zinc-400 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer">保存</button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 cursor-pointer">取消</button>
            </div>
          </form>
        )}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm space-y-6">
          {renderGroup('收入分类', incomeCats, 'text-green-700')}
          {renderGroup('支出分类', expenseCats, 'text-red-700')}
        </div>
      </main>
    </>
  );
}
