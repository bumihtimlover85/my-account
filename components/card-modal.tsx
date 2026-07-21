'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, PRIORITIES } from '@/types';
import { updateCard, addSubtask, toggleSubtask, addComment, deleteCard } from '@/app/actions';
import { X, Save, Trash2, Plus, ListChecks, MessageSquare, Send, CheckSquare } from 'lucide-react';

interface CardModalProps {
  card: Card;
  onClose: () => void;
  onUpdate: () => void;
}

export default function CardModal({ card, onClose, onUpdate }: CardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [priority, setPriority] = useState(card.priority);
  const [newSubtask, setNewSubtask] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleSave = async () => {
    setLoading(true);
    await updateCard(card.id, { title, description, priority });
    onUpdate();
    setLoading(false);
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;
    await addSubtask(card.id, newSubtask);
    setNewSubtask('');
    onUpdate();
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    await toggleSubtask(subtaskId);
    onUpdate();
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    await addComment(card.id, comment);
    setComment('');
    onUpdate();
  };

  const handleDelete = async () => {
    if (confirm('确定删除此卡片？')) {
      await deleteCard(card.id);
      onUpdate();
      handleClose();
    }
  };

  const completedSubtasks = card.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = card.subtasks.length;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
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
          relative bg-surface dark:bg-surface-elevated rounded-2xl shadow-modal w-full max-w-lg max-h-[85vh] overflow-y-auto
          border border-border-light/50
          transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* 头部 */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1 mr-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-lg font-semibold text-text-primary bg-transparent
                  border-b border-transparent hover:border-border-light focus:border-brand-400
                  outline-none transition-all duration-200 pb-1
                  focus:ring-0"
                placeholder="卡片标题"
              />
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
                text-text-tertiary hover:text-text-primary hover:bg-surface-hover
                transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 优先级 */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-text-tertiary mb-2 uppercase tracking-wider">
              优先级
            </label>
            <div className="flex gap-2">
              {Object.entries(PRIORITIES).map(([key, val]) => (
                <button
                  key={key}
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

          {/* 描述 */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-text-tertiary mb-2 uppercase tracking-wider">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-border-light rounded-xl p-3 text-sm
                bg-surface dark:bg-surface-muted text-text-primary
                placeholder:text-text-tertiary
                resize-none h-24
                transition-all duration-200
                focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15
                outline-none"
              placeholder="添加描述..."
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={handleSave}
              disabled={loading}
              className="
                flex items-center gap-1.5 px-4 py-2 rounded-xl
                bg-gradient-to-br from-brand-500 to-brand-600 text-white text-sm font-medium
                hover:from-brand-600 hover:to-brand-700
                shadow-lg shadow-brand-500/15
                transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                active:scale-95
                disabled:opacity-50
                focus:outline-none focus:ring-2 focus:ring-brand-500/40
              "
            >
              <Save className="w-3.5 h-3.5" />
              {loading ? '保存中...' : '保存'}
            </button>
            <button
              onClick={handleDelete}
              className="
                flex items-center gap-1.5 px-3 py-2 rounded-xl
                text-text-tertiary hover:text-error hover:bg-error-bg
                text-sm transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                active:scale-95
              "
            >
              <Trash2 className="w-3.5 h-3.5" />
              删除
            </button>
          </div>

          {/* 子任务 */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="w-4 h-4 text-text-tertiary" />
              <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                子任务
              </span>
              {totalSubtasks > 0 && (
                <span className="text-[10px] text-text-tertiary ml-auto">
                  {completedSubtasks}/{totalSubtasks}
                </span>
              )}
            </div>
            <div className="space-y-1.5 mb-2.5">
              {card.subtasks.map((sub) => (
                <label
                  key={sub.id}
                  onClick={() => handleToggleSubtask(sub.id)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl
                    hover:bg-surface-hover cursor-pointer
                    transition-all duration-200 group"
                >
                  <div className={`
                    w-4 h-4 rounded-md border-2 flex items-center justify-center
                    transition-all duration-200
                    ${sub.completed
                      ? 'bg-brand-500 border-brand-500'
                      : 'border-border-default group-hover:border-brand-400'
                    }
                  `}>
                    {sub.completed && <CheckSquare className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm transition-all duration-200 ${
                    sub.completed
                      ? 'line-through text-text-tertiary'
                      : 'text-text-primary'
                  }`}>
                    {sub.title}
                  </span>
                </label>
              ))}
              {card.subtasks.length === 0 && (
                <p className="text-xs text-text-tertiary px-1">暂无子任务</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                placeholder="添加子任务..."
                className="flex-1 border border-border-light rounded-xl px-3 py-2 text-sm
                  bg-surface dark:bg-surface-muted text-text-primary placeholder:text-text-tertiary
                  outline-none transition-all duration-200
                  focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15"
              />
              <button
                onClick={handleAddSubtask}
                className="w-9 h-9 rounded-xl flex items-center justify-center
                  bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400
                  hover:bg-brand-200 dark:hover:bg-brand-900/50
                  transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  active:scale-90"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 评论 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-text-tertiary" />
              <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                评论
              </span>
            </div>
            <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
              {card.comments.map((c) => (
                <div key={c.id} className="bg-surface-hover dark:bg-surface-muted rounded-xl p-3 animate-slide-up">
                  <p className="text-[11px] font-medium text-text-secondary mb-1">
                    {c.user?.name || '用户'}
                  </p>
                  <p className="text-sm text-text-primary">{c.content}</p>
                </div>
              ))}
              {card.comments.length === 0 && (
                <p className="text-xs text-text-tertiary px-1">暂无评论</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="添加评论..."
                className="flex-1 border border-border-light rounded-xl px-3 py-2 text-sm
                  bg-surface dark:bg-surface-muted text-text-primary placeholder:text-text-tertiary
                  outline-none transition-all duration-200
                  focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15"
              />
              <button
                onClick={handleAddComment}
                className="w-9 h-9 rounded-xl flex items-center justify-center
                  bg-gradient-to-br from-brand-500 to-brand-600 text-white
                  hover:from-brand-600 hover:to-brand-700
                  shadow-lg shadow-brand-500/15
                  transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  active:scale-90"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
