'use client';
import { useState, useCallback, useRef } from 'react';
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
import { arrayMove } from '@dnd-kit/sortable';
import { Card, COLUMNS } from '@/types';
import KanbanColumn from './kanban-column';
import KanbanCard from './kanban-card';
import CardModal from './card-modal';
import AddCardModal from './add-card-modal';
import { moveCard } from '@/app/actions';

interface KanbanBoardProps {
  initialCards: Card[];
}

export default function KanbanBoard({ initialCards }: KanbanBoardProps) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [addCardStatus, setAddCardStatus] = useState<string | null>(null);
  const cardsRef = useRef(cards);
  cardsRef.current = cards;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getCardsByStatus = useCallback(
    (status: string) => cards.filter((c) => c.status === status).sort((a, b) => a.position - b.position),
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

    // Use functional update to get latest state
    let finalStatus = '';
    let finalPosition = 0;
    
    setCards((prev) => {
      const activeCard = prev.find((c) => c.id === activeId);
      const overCard = prev.find((c) => c.id === overId);
      if (!activeCard) return prev;
      
      const overColumn = COLUMNS.find((col) => col.id === overId);
      finalStatus = overCard?.status || overColumn?.id || activeCard.status;
      
      const updated = prev.map((c) => (c.id === activeId ? { ...c, status: finalStatus } : c));
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

    // Persist to server with correct position
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
        <div className="flex gap-4 overflow-x-auto p-4 h-[calc(100vh-80px)]">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              cards={getCardsByStatus(column.id)}
              onCardClick={(card) => setSelectedCard(card)}
              onAddCard={() => setAddCardStatus(column.id)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeCard && <KanbanCard card={activeCard} onClick={() => {}} />}
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
        <AddCardModal
          defaultStatus={addCardStatus}
          onClose={() => setAddCardStatus(null)}
          onUpdate={handleRefresh}
        />
      )}
    </>
  );
}
