'use client';
import { useState } from 'react';
import { Card, PRIORITIES } from '@/types';
import { updateCard, addSubtask, toggleSubtask, addComment, deleteCard } from '@/app/actions';

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
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold w-full border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none"
            />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl ml-2">✕</button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
            <div className="flex gap-2">
              {Object.entries(PRIORITIES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setPriority(key)}
                  className={`px-3 py-1 rounded-full text-sm ${val.color} ${priority === key ? 'ring-2 ring-offset-1' : ''}`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm h-20 resize-none"
              placeholder="添加描述..."
            />
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存'}
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-50"
            >
              删除卡片
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">子任务</label>
            <div className="space-y-1 mb-2">
              {card.subtasks.map((sub) => (
                <label key={sub.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={sub.completed}
                    onChange={() => handleToggleSubtask(sub.id)}
                  />
                  <span className={sub.completed ? 'line-through text-gray-400' : ''}>
                    {sub.title}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                placeholder="添加子任务..."
                className="flex-1 border rounded-lg px-2 py-1 text-sm"
              />
              <button onClick={handleAddSubtask} className="text-blue-600 text-sm hover:underline">
                添加
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">评论</label>
            <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
              {card.comments.map((c) => (
                <div key={c.id} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500 mb-1">{c.user?.name || '用户'}</p>
                  <p className="text-sm">{c.content}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="添加评论..."
                className="flex-1 border rounded-lg px-2 py-1 text-sm"
              />
              <button onClick={handleAddComment} className="text-blue-600 text-sm hover:underline">
                发送
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
