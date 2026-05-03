'use client';

import { useState } from 'react';
import { TransactionType } from '@/types';
import { useStore } from '@/hooks/useStore';
import { getStore } from '@/lib/store';
import { Plus, Minus } from 'lucide-react';
import { formatISO, startOfToday, parseISO, isValid } from 'date-fns';

interface Props {
  onSuccess?: () => void;
}

export default function TransactionForm({ onSuccess }: Props) {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(formatISO(startOfToday(), { representation: 'date' }));
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const { categories } = useStore();
  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedAmount = amount.trim();
    if (!/^\d+(\.\d{1,2})?$/.test(trimmedAmount)) {
      setError('请输入有效的金额（最多两位小数）');
      return;
    }
    const numAmount = parseFloat(trimmedAmount);
    if (numAmount <= 0 || numAmount > 999999999) {
      setError('金额必须大于 0 且小于 10 亿');
      return;
    }

    if (!categoryId) {
      setError('请选择分类');
      return;
    }

    const parsedDate = parseISO(date);
    if (!isValid(parsedDate)) {
      setError('请选择有效日期');
      return;
    }

    // Use date-fns formatted date string (YYYY-MM-DD)
    const dateStr = formatISO(parsedDate, { representation: 'date' });

    getStore().addTransaction({
      amount: numAmount,
      type,
      categoryId,
      date: dateStr,
      note: note.trim(),
    });

    setAmount('');
    setCategoryId('');
    setNote('');
    setDate(formatISO(startOfToday(), { representation: 'date' }));
    onSuccess?.();
  };

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
          <label htmlFor="tx-amount" className="block text-sm font-medium text-zinc-700 mb-1.5">金额</label>
          <input
            id="tx-amount"
            type="number"
            step="0.01"
            min="0.01"
            max="999999999"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">分类</label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="选择分类">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="radio"
                aria-checked={categoryId === cat.id}
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
            <label htmlFor="tx-date" className="block text-sm font-medium text-zinc-700 mb-1.5">日期</label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="tx-note" className="block text-sm font-medium text-zinc-700 mb-1.5">备注</label>
            <input
              id="tx-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="可选"
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">{error}</p>
        )}
        <button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-zinc-900 text-white font-medium text-sm hover:bg-zinc-800 active:bg-zinc-950 transition-colors cursor-pointer"
        >
          记一笔
        </button>
      </div>
    </form>
  );
}
