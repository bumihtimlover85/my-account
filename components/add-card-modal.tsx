'use client';
import { useState } from 'react';
import { createCard } from '@/app/actions';
import { COLUMNS, PRIORITIES } from '@/types';

interface AddCardModalProps {
  defaultStatus: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function AddCardModal({ defaultStatus, onClose, onUpdate }: AddCardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState(defaultStatus);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await createCard({ title, description, priority, status });
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">新建卡片</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="输入卡片标题..."
                autoFocus
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm h-20 resize-none"
                placeholder="添加描述..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                {COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
              <div className="flex gap-2">
                {Object.entries(PRIORITIES).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPriority(key)}
                    className={`px-3 py-1 rounded-full text-sm ${val.color} ${priority === key ? 'ring-2 ring-offset-1' : ''}`}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '创建中...' : '创建'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
