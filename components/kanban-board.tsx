'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Card, COLUMNS } from '@/types';
import KanbanColumn from './kanban-column';
import KanbanCard from './kanban-card';
import CardModal from './card-modal';
import AddCardModal from './add-card-modal';
import { moveCard } from '@/app/actions';

const VALID_STATUSES = ['todo', 'in_progress', 'testing', 'done'] as const;

interface KanbanBoardProps {
  currentProjectId: string;
  initialCards: Card[];
}

export default function KanbanBoard({ initialCards, currentProjectId }: KanbanBoardProps) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [addCardStatus, setAddCardStatus] = useState<string | null>(null);
  const cardsRef = useRef(cards);

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const getCardsByStatus = useCallback(
    (status: string) =>
      cards.filter((c) => c.status === status).sort((a, b) => a.position - b.position),
    [cards]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find((c) => c.id === event.active.id);
    if (card) setActiveCard(card);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeCard = cards.find((c) => c.id === activeId);
    const overCard = cards.find((c) => c.id === overId);
    if (!activeCard) return;
    const overColumn = COLUMNS.find((col) => col.id === overId);
    if (overColumn && activeCard.status !== overColumn.id) {
      setCards((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, status: overColumn.id } : c))
      );
      return;
    }
    if (overCard && activeCard.status !== overCard.status) {
      setCards((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, status: overCard.status } : c))
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    // 获取最新状态并计算 finalStatus
    let finalStatus = '';
    let finalPosition = 0;

    setCards((prev) => {
      const activeCard = prev.find((c) => c.id === activeId);
      const overCard = prev.find((c) => c.id === overId);
      if (!activeCard) return prev;

      const overColumn = COLUMNS.find((col) => col.id === overId);
      // 安全计算: 取有效的状态值
      const targetStatus = overCard?.status || overColumn?.id || activeCard.status;
      finalStatus = VALID_STATUSES.includes(targetStatus as typeof VALID_STATUSES[number])
        ? targetStatus
        : activeCard.status;

      const updated = prev.map((c) =>
        c.id === activeId ? { ...c, status: finalStatus } : c
      );
      const sameStatus = updated.filter((c) => c.status === finalStatus);
      finalPosition = sameStatus.findIndex((c) => c.id === activeId);

      return updated.map((c) => {
        if (c.status === finalStatus) {
          const pos = sameStatus.findIndex((sc) => sc.id === c.id);
          return { ...c, position: pos >= 0 ? pos : c.position };
        }
        return c;
      });
    });

    // 确保 finalStatus 有效后再调用 moveCard
    if (!finalStatus || !VALID_STATUSES.includes(finalStatus as typeof VALID_STATUSES[number])) {
      return;
    }
    await moveCard(activeId, finalStatus, Math.max(0, finalPosition));
  };

  const handleRefresh = async () => {
    const res = await fetch('/api/cards');
    const data = await res.json();
    setCards(data);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5 overflow-x-auto p-4 sm:p-6 h-[calc(100vh-100px)]">
          {COLUMNS.map((column, idx) => (
            <div
              key={column.id}
              className="animate-slide-in-right"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <KanbanColumn
                id={column.id}
                title={column.title}
                color={column.color}
                borderColor={column.borderColor}
                cards={getCardsByStatus(column.id)}
                onCardClick={(card) => setSelectedCard(card)}
                onAddCard={() => setAddCardStatus(column.id)}
              />
            </div>
          ))}
        </div>
        <DragOverlay>
          {activeCard && (
            <div className="rotate-[3deg] scale-105 shadow-elevated">
              <KanbanCard card={activeCard} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedCard && (
        <CardModal
          card={cards.find((c) => c.id === selectedCard.id) || selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleRefresh}
        />
      )}

      {addCardStatus && (
        <AddCardModal projectId={currentProjectId} 
          defaultStatus={addCardStatus}
          onClose={() => setAddCardStatus(null)}
          onUpdate={handleRefresh}
        />
      )}
    </>
  );
}
