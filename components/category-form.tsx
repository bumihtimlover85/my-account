'use client';
import { useState } from 'react';
import { createCategory } from '@/app/actions';
import { Plus } from 'lucide-react';

const PRESET_COLORS = [
  '#DC2626', '#EA580C', '#D97706', '#65A30D', '#16A34A',
  '#059669', '#0D9488', '#0891B2', '#0284C7', '#2563EB',
  '#4F46E5', '#7C3AED', '#9333EA', '#C026D3', '#DB2777',
  '#E11D48', '#71717A',
];

export default function CategoryForm() {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('请输入分类名称');
      return;
    }
    setLoading(true);
    try {
      await createCategory({ name, type, color });
      setName('');
      setShowAdd(false);
    } catch (err: unknown) {
      setError((err as { message?: string }).message || '创建失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          新建分类
        </button>
      </div>
      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                type === 'EXPENSE' ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-zinc-50 text-zinc-500'
              }`}
            >支出</button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                type === 'INCOME' ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-zinc-50 text-zinc-500'
              }`}
            >收入</button>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="分类名称"
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:border-blue-500"
          />
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'ring-2 ring-offset-2 ring-zinc-400 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`选择颜色 ${c}`}
              />
            ))}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50"
            >保存</button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 cursor-pointer"
            >取消</button>
          </div>
        </form>
      )}
    </>
  );
}
