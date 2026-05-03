'use client';
import { useState } from 'react';
import { TransactionType } from '@/types';
import { createTransaction } from '@/app/actions';
import { Plus, Minus } from 'lucide-react';
import { Category } from '@prisma/client';

interface Props {
  categories: Category[];
  onSuccess?: () => void;
}

export default function TransactionForm({ categories, onSuccess }: Props) {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || !isFinite(numAmount)) {
      setError('请输入有效的金额');
      return;
    }
    if (!categoryId) {
      setError('请选择分类');
      return;
    }
    setLoading(true);
    try {
      await createTransaction({
        amount: numAmount,
        type,
        categoryId,
        date,
        note: note.trim(),
      });
      setAmount('');
      setCategoryId('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      onSuccess?.();
    } catch (err: { message?: string }) {
      setError(err.message || '提交失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={() => { setType('EXPENSE'); setCategoryId(''); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            type === 'EXPENSE'
              ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
              : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'
          }`}
        >
          <Minus className="w-4 h-4" />
          支出
        </button>
        <button
          type="button"
          onClick={() => { setType('INCOME'); setCategoryId(''); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            type === 'INCOME'
              ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
              : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'
          }`}
        >
          <Plus className="w-4 h-4" />
          收入
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-zinc-700 mb-1.5">金额</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <p className="block text-sm font-medium text-zinc-700 mb-1.5">分类</p>
          <div className="flex flex-wrap gap-2">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  categoryId === cat.id
                    ? 'text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
                style={categoryId === cat.id ? { backgroundColor: cat.color } : undefined}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-zinc-700 mb-1.5">日期</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-zinc-700 mb-1.5">备注</label>
            <input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="可选"
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-zinc-900 text-white font-medium text-sm hover:bg-zinc-800 active:bg-zinc-950 transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? '提交中...' : '记一笔'}
        </button>
      </div>
    </form>
  );
}
