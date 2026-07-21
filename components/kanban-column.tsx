'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card as CardType } from '@/types';
import KanbanCard from './kanban-card';
import { Plus, Circle, Play, Bug, CheckCircle } from 'lucide-react';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  borderColor: string;
  cards: CardType[];
  onCardClick: (card: CardType) => void;
  onAddCard: () => void;
}

const columnIcons: Record<string, React.ReactNode> = {
  todo: <Circle className="w-3.5 h-3.5" />,
  in_progress: <Play className="w-3.5 h-3.5" />,
  testing: <Bug className="w-3.5 h-3.5" />,
  done: <CheckCircle className="w-3.5 h-3.5" />,
};

const columnColors: Record<string, string> = {
  todo: 'text-brand-600 dark:text-brand-400',
  in_progress: 'text-blue-600 dark:text-blue-400',
  testing: 'text-amber-600 dark:text-amber-400',
  done: 'text-emerald-600 dark:text-emerald-400',
};

export default function KanbanColumn({
  id, title, color, borderColor, cards, onCardClick, onAddCard,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] sm:w-[300px] flex-shrink-0 animate-slide-up">
      {/* 列头 */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={columnColors[id] || 'text-text-secondary'}>
            {columnIcons[id]}
          </span>
          <h2 className="font-semibold text-sm text-text-primary">{title}</h2>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface border border-border-light text-text-tertiary">
            {cards.length}
          </span>
        </div>
        <button
          onClick={onAddCard}
          className="
            flex items-center justify-center w-7 h-7 rounded-lg
            text-text-tertiary hover:text-text-primary
            hover:bg-surface-hover
            transition-all duration-200 ease-out-expo
            active:scale-90
            focus:outline-none focus:ring-2 focus:ring-brand-500/30
          "
          title="添加卡片"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 可拖放区域 — 列背景 */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 rounded-xl border-2 p-2.5 space-y-2.5
          overflow-y-auto max-h-[calc(100vh-200px)]
          transition-all duration-200 ease-out-expo
          ${color} ${borderColor}
          ${isOver ? 'border-dashed scale-[1.01] ring-2 ring-brand-400/30' : 'border-transparent'}
        `}
      >
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 rounded-xl bg-surface/50 flex items-center justify-center mb-2">
                <Plus className="w-4 h-4 text-text-tertiary" />
              </div>
              <p className="text-xs text-text-tertiary">拖拽卡片到此处</p>
            </div>
          ) : (
            cards.map((card, index) => (
              <div key={card.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.03}s` }}>
                <KanbanCard card={card} onClick={() => onCardClick(card)} />
              </div>
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
