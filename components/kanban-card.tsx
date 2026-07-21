'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, PRIORITIES } from '@/types';
import { MessageSquare, ListChecks } from 'lucide-react';

interface KanbanCardProps {
  card: Card;
  onClick: () => void;
  style?: React.CSSProperties;
}

export default function KanbanCard({ card, onClick, style }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { card },
  });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    ...style,
  };

  const completedSubtasks = card.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = card.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  const priority = PRIORITIES[card.priority as keyof typeof PRIORITIES];

  return (
    <div
      ref={setNodeRef}
      style={sortableStyle}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        group cursor-grab active:cursor-grabbing
        transition-all duration-200 ease-out-expo
        ${isDragging ? 'scale-105 rotate-[2deg] shadow-elevated z-50' : 'hover:shadow-card-hover hover:-translate-y-0.5'}
      `}
    >
      {/* Double-Bezel: 外框 */}
      <div className="p-[1.5px] rounded-xl bg-gradient-to-b from-border-light to-transparent dark:from-border-light/30">
        {/* Double-Bezel: 内芯 */}
        <div className="rounded-[calc(14px-1.5px)] bg-surface p-3.5">
          {/* 优先级指示条 */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${priority.color}`}>
              {priority.label}
            </span>
          </div>

          {/* 标题 */}
          <h3 className="text-sm font-medium text-text-primary leading-snug mb-1.5 line-clamp-2">
            {card.title}
          </h3>

          {/* 描述预览 */}
          {card.description && (
            <p className="text-xs text-text-tertiary mb-2.5 line-clamp-1">
              {card.description}
            </p>
          )}

          {/* 底部指标 */}
          <div className="flex items-center gap-3 text-text-tertiary">
            {totalSubtasks > 0 && (
              <div className="flex items-center gap-1.5 flex-1">
                <div className="flex-1 h-1 rounded-full bg-surface-hover overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out-expo"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="flex items-center gap-0.5 text-[10px]">
                  <ListChecks className="w-3 h-3" />
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </div>
            )}
            {card.comments.length > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] ml-auto">
                <MessageSquare className="w-3 h-3" />
                {card.comments.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
