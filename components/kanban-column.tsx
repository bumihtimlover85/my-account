'use client';

import { Column, Card } from '@/types';
import { KanbanCard } from './kanban-card';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import { deleteColumn, createCard } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface KanbanColumnProps {
  column: Column;
  boardId: string;
}

export function KanbanColumn({ column, boardId }: KanbanColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const router = useRouter();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDeleteColumn = async () => {
    if (confirm('确定要删除这个列吗？所有卡片都会被删除。')) {
      await deleteColumn(column.id);
      router.refresh();
    }
  };

  const handleAddCard = async () => {
    if (newCardTitle.trim()) {
      await createCard({
        title: newCardTitle.trim(),
        columnId: column.id,
        order: column.cards.length,
      });
      setNewCardTitle('');
      setIsAddingCard(false);
      router.refresh();
    }
  };

  const cardIds = column.cards.map((card) => card.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-100 rounded-lg p-4 min-w-[300px] max-h-[calc(100vh-200px)] flex flex-col ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between mb-3 cursor-grab"
      >
        <h3 className="font-semibold text-gray-700">{column.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {column.cards.length}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>编辑列</DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteColumn}
                className="text-red-600"
              >
                删除列
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto space-y-2 mb-3">
          {column.cards.map((card) => (
            <KanbanCard key={card.id} card={card} />
          ))}
        </div>
      </SortableContext>

      {isAddingCard ? (
        <div className="space-y-2">
          <input
            type="text"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="输入卡片标题..."
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCard();
              if (e.key === 'Escape') {
                setIsAddingCard(false);
                setNewCardTitle('');
              }
            }}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddCard}>
              添加
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAddingCard(false);
                setNewCardTitle('');
              }}
            >
              取消
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-500"
          onClick={() => setIsAddingCard(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          添加卡片
        </Button>
      )}
    </div>
  );
}
