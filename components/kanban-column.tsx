'use client';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from '@/types';
import KanbanCard from './kanban-card';
import { Plus, Circle, Play, Bug, CheckCircle } from 'lucide-react';

const COLUMN_ICONS: Record<string, React.ReactNode> = {
  todo: <Circle className="w-4 h-4" />,
  in_progress: <Play className="w-4 h-4" />,
  testing: <Bug className="w-4 h-4" />,
  done: <CheckCircle className="w-4 h-4" />,
};

const COLUMN_BG = {
  todo: 'bg-column-todo-bg/70 dark:bg-column-todo-bg/40',
  in_progress: 'bg-column-progress-bg/70 dark:bg-column-progress-bg/40',
  testing: 'bg-column-testing-bg/70 dark:bg-column-testing-bg/40',
  done: 'bg-column-done-bg/70 dark:bg-column-done-bg/40',
};

const COLUMN_HEADER_BG = {
  todo: 'bg-column-todo-bg dark:bg-column-todo-bg/60',
  in_progress: 'bg-column-progress-bg dark:bg-column-progress-bg/60',
  testing: 'bg-column-testing-bg dark:bg-column-testing-bg/60',
  done: 'bg-column-done-bg dark:bg-column-done-bg/60',
};

const COLUMN_DOT_COLOR = {
  todo: 'bg-column-todo',
  in_progress: 'bg-column-progress',
  testing: 'bg-column-testing',
  done: 'bg-column-done',
};

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  borderColor: string;
  cards: Card[];
  onCardClick: (card: Card) => void;
  onAddCard: () => void;
}

export default function KanbanColumn({ id, title, cards, onCardClick, onAddCard }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col flex-shrink-0 w-72 sm:w-80">
      {/* 列内容 */}
      <div
        className={`
          ${COLUMN_BG[id as keyof typeof COLUMN_BG] || 'bg-surface-hover'}
          rounded-2xl border border-border-light/50
          flex flex-col flex-1
          transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isOver ? 'ring-2 ring-brand-400/30 shadow-elevated' : ''}
        `}
      >
        {/* 列头 */}
        <div className={`
          ${COLUMN_HEADER_BG[id as keyof typeof COLUMN_HEADER_BG] || 'bg-surface-hover'}
          rounded-t-2xl px-4 py-3
          flex items-center justify-between
          border-b border-border-light/30
        `}>
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${COLUMN_DOT_COLOR[id as keyof typeof COLUMN_DOT_COLOR] || 'bg-text-tertiary'} animate-bounce-gentle`} />
            <span className="text-sm font-semibold text-text-primary">{title}</span>
            <span className="text-xs font-medium text-text-tertiary bg-surface/50 dark:bg-surface-muted/50 rounded-full px-2 py-0.5 min-w-[1.5rem] text-center">
              {cards.length}
            </span>
          </div>
          <button
            onClick={onAddCard}
            className="w-7 h-7 rounded-lg flex items-center justify-center
              text-text-tertiary hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20
              transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              active:scale-90"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* 卡片列表 */}
        <div
          ref={setNodeRef}
          className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px]"
        >
          <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {cards.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-surface-hover dark:bg-surface-muted flex items-center justify-center mb-2">
                  <Circle className="w-4 h-4 text-text-tertiary/50" />
                </div>
                <p className="text-xs text-text-tertiary/60">拖拽卡片到这里</p>
              </div>
            )}
            {cards.map((card, idx) => (
              <div
                key={card.id}
                className="animate-slide-up"
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <KanbanCard card={card} onClick={() => onCardClick(card)} />
              </div>
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}
