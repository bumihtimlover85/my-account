'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, PRIORITIES } from '@/types';
import { GripVertical, ListChecks, MessageSquare, AlertCircle } from 'lucide-react';

interface KanbanCardProps {
  card: Card;
  onClick: () => void;
}

const PRIORITY_BADGES: Record<string, { label: string; dot: string; border: string }> = {
  high: { label: '高', dot: 'bg-red-500', border: 'border-l-red-400' },
  medium: { label: '中', dot: 'bg-amber-500', border: 'border-l-amber-400' },
  low: { label: '低', dot: 'bg-emerald-500', border: 'border-l-emerald-400' },
};

export default function KanbanCard({ card, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priority = PRIORITY_BADGES[card.priority] || PRIORITY_BADGES.medium;
  const completedSubtasks = card.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = card.subtasks.length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        bg-surface dark:bg-surface-elevated
        rounded-xl border border-border-light/60
        border-l-4 ${priority.border}
        shadow-card hover:shadow-card-hover
        cursor-pointer
        transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]
        active:scale-[0.98]
        group
        ${isDragging ? 'shadow-elevated rotate-[2deg] z-50' : ''}
      `}
    >
      <div className="p-3.5">
        {/* 拖动把手 + 优先级 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <GripVertical className="w-3.5 h-3.5 text-text-tertiary/40" />
            </div>
            <span className={`
              text-[10px] font-semibold px-1.5 py-0.5 rounded-md
              ${PRIORITIES[card.priority as keyof typeof PRIORITIES]?.color}
            `}>
              {priority.label}
            </span>
          </div>
          <div className={`w-2 h-2 rounded-full ${priority.dot} ${card.priority === 'high' ? 'animate-pulse-glow' : ''}`} />
        </div>

        {/* 标题 */}
        <h3 className="text-sm font-medium text-text-primary leading-snug line-clamp-2">
          {card.title}
        </h3>

        {/* 描述预览 */}
        {card.description && (
          <p className="text-xs text-text-tertiary mt-1.5 line-clamp-1">
            {card.description}
          </p>
        )}

        {/* 底部指标 */}
        <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-border-light/30">
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-1 text-text-tertiary">
              <ListChecks className="w-3 h-3" />
              <span className="text-[10px] font-medium">
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}
          {card.comments && card.comments.length > 0 && (
            <div className="flex items-center gap-1 text-text-tertiary">
              <MessageSquare className="w-3 h-3" />
              <span className="text-[10px] font-medium">{card.comments.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
