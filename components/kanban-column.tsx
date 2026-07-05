'use client';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card as CardType } from '@/types';
import KanbanCard from './kanban-card';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  cards: CardType[];
  onCardClick: (card: CardType) => void;
  onAddCard: () => void;
}

export default function KanbanColumn({ id, title, color, cards, onCardClick, onAddCard }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className={`rounded-lg ${color} p-3 min-w-[280px] flex flex-col max-h-[calc(100vh-120px)]`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-700 flex items-center gap-2">
          {title}
          <span className="bg-white text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {cards.length}
          </span>
        </h2>
        <button
          onClick={onAddCard}
          className="text-gray-500 hover:text-gray-700 text-lg font-bold"
          title="添加卡片"
        >
          +
        </button>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto space-y-2 rounded-lg p-1 ${
          isOver ? 'bg-white/50 ring-2 ring-blue-400' : ''
        }`}
      >
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard key={card.id} card={card} onClick={() => onCardClick(card)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
