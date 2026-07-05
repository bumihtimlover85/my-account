'use client';

import { Card, Subtask, Comment } from '@/types';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit3, Save, X } from 'lucide-react';
import { updateCard, deleteCard, createSubtask, updateSubtask, deleteSubtask, createComment, deleteComment } from '@/app/actions';

interface CardDetailProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
}

export function CardDetail({ card, isOpen, onClose }: CardDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const router = useRouter();

  const handleSave = async () => {
    await updateCard(card.id, { title, description });
    setIsEditing(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (confirm('确定要删除这个卡片吗？')) {
      await deleteCard(card.id);
      onClose();
      router.refresh();
    }
  };

  const handleAddSubtask = async () => {
    if (newSubtask.trim()) {
      await createSubtask({
        title: newSubtask.trim(),
        cardId: card.id,
      });
      setNewSubtask('');
      router.refresh();
    }
  };

  const handleToggleSubtask = async (subtask: Subtask) => {
    await updateSubtask(subtask.id, { completed: !subtask.completed });
    router.refresh();
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    await deleteSubtask(subtaskId);
    router.refresh();
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      await createComment({
        content: newComment.trim(),
        cardId: card.id,
      });
      setNewComment('');
      router.refresh();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
    router.refresh();
  };

  const completedSubtasks = card.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = card.subtasks?.length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            {isEditing ? (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-bold w-full p-1 border rounded"
              />
            ) : (
              <DialogTitle className="text-xl">{card.title}</DialogTitle>
            )}
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" />
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setTitle(card.title);
                      setDescription(card.description || '');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* 描述 */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">描述</h4>
            {isEditing ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="添加描述..."
                rows={3}
              />
            ) : (
              <p className="text-gray-600 text-sm">
                {card.description || '暂无描述'}
              </p>
            )}
          </div>

          {/* 子任务 */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">
              子任务
              {totalSubtasks > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({completedSubtasks}/{totalSubtasks})
                </span>
              )}
            </h4>
            
            <div className="space-y-2">
              {card.subtasks?.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-2 group"
                >
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => handleToggleSubtask(subtask)}
                  />
                  <span
                    className={`flex-1 text-sm ${
                      subtask.completed
                        ? 'line-through text-gray-400'
                        : 'text-gray-700'
                    }`}
                  >
                    {subtask.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="添加子任务..."
                className="flex-1 p-2 text-sm border rounded"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubtask();
                }}
              />
              <Button size="sm" onClick={handleAddSubtask}>
                添加
              </Button>
            </div>
          </div>

          {/* 评论 */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">评论</h4>
            
            <div className="space-y-3 mb-4">
              {card.comments?.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-50 rounded-lg p-3 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        {comment.user.name || comment.user.email}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="写下你的评论..."
                rows={2}
              />
              <Button size="sm" onClick={handleAddComment}>
                发表评论
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
