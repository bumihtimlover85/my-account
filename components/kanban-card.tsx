'use client';

import { Card } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreHorizontal, MessageSquare, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteCard } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface KanbanCardProps {
  card: Card;
}

export function KanbanCard({ card }: KanbanCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'Card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = async () => {
    if (confirm('确定要删除这个卡片吗？')) {
      setIsDeleting(true);
      await deleteCard(card.id);
      router.refresh();
    }
  };

  const completedSubtasks = card.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = card.subtasks?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-md shadow-sm border border-gray-200 p-3 cursor-grab hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {card.title}
            </h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 -mr-1">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>编辑</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600"
                >
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {card.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {card.description}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-2">
            {totalSubtasks > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <CheckSquare className="h-3 w-3" />
                <span>
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </div>
            )}
            
            {card.comments && card.comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MessageSquare className="h-3 w-3" />
                <span>{card.comments.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
