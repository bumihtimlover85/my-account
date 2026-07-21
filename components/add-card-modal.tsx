'use client';
import { useState, useEffect } from 'react';
import { createCard } from '@/app/actions';
import { COLUMNS, PRIORITIES } from '@/types';
import { X, Plus } from 'lucide-react';

interface AddCardModalProps {
  projectId: string;
  defaultStatus: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function AddCardModal({ defaultStatus, onClose, onUpdate, projectId }: AddCardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState(defaultStatus);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await createCard({ title, description, priority, status, projectId });
    onUpdate();
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* 遮罩 */}
      <div
        className={`absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 模态框 */}
      <div
        className={`
          relative bg-surface dark:bg-surface-elevated rounded-2xl shadow-modal w-full max-w-md
          border border-border-light/50
          transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center shadow-sm">
                <Plus className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-text-primary">新建卡片</h2>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center
                text-text-tertiary hover:text-text-primary hover:bg-surface-hover
                transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 标题 */}
            <div>
              <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">
                标题 <span className="text-error">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-border-light rounded-xl px-3.5 py-2.5 text-sm
                  bg-surface dark:bg-surface-muted text-text-primary placeholder:text-text-tertiary
                  outline-none transition-all duration-200
                  focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15"
                placeholder="输入卡片标题..."
                autoFocus
                required
              />
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">
                描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-border-light rounded-xl px-3.5 py-2.5 text-sm
                  bg-surface dark:bg-surface-muted text-text-primary placeholder:text-text-tertiary
                  outline-none transition-all duration-200 resize-none h-20
                  focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15"
                placeholder="添加描述..."
              />
            </div>

            {/* 状态 */}
            <div>
              <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">
                状态
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {COLUMNS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setStatus(col.id)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium
                      transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                      active:scale-95
                      ${status === col.id
                        ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm'
                        : 'bg-surface-hover text-text-secondary hover:bg-surface-hover/80'
                      }
                    `}
                  >
                    {col.title}
                  </button>
                ))}
              </div>
            </div>

            {/* 优先级 */}
            <div>
              <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">
                优先级
              </label>
              <div className="flex gap-2">
                {Object.entries(PRIORITIES).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPriority(key)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium
                      transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                      active:scale-95
                      ${priority === key
                        ? `${val.color} ring-2 ring-offset-1 ring-current dark:ring-offset-surface-elevated`
                        : 'text-text-tertiary bg-surface-hover hover:bg-surface-hover/80'
                      }
                    `}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="
                  flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl
                  bg-gradient-to-br from-brand-500 to-brand-600 text-white text-sm font-medium
                  hover:from-brand-600 hover:to-brand-700
                  shadow-lg shadow-brand-500/15
                  transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  active:scale-95
                  disabled:opacity-50
                  focus:outline-none focus:ring-2 focus:ring-brand-500/40
                "
              >
                <Plus className="w-4 h-4" />
                {loading ? '创建中...' : '创建'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-sm text-text-secondary
                  hover:bg-surface-hover
                  transition-all duration-200"
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
