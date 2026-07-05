'use client';

import { Board, Column, Card } from '@/types';
import { KanbanColumn } from './kanban-column';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { KanbanCard } from './kanban-card';
import { updateCardOrder, moveCardToColumn, updateColumnOrder } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface KanbanBoardProps {
  board: Board;
}

export function KanbanBoard({ board }: KanbanBoardProps) {
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;
    
    if (activeData?.type === 'Column') {
      setActiveColumn(activeData.column);
    } else if (activeData?.type === 'Card') {
      setActiveCard(activeData.card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // 处理卡片拖拽到不同列
    if (activeData?.type === 'Card' && overData?.type === 'Card') {
      const activeCard = activeData.card;
      const overCard = overData.card;

      if (activeCard.columnId !== overCard.columnId) {
        // 移动卡片到不同列
        moveCardToColumn(activeCard.id, overCard.columnId, overCard.order);
      }
    }

    // 处理卡片拖拽到列上
    if (activeData?.type === 'Card' && overData?.type === 'Column') {
      const activeCard = activeData.card;
      const overColumn = overData.column;

      if (activeCard.columnId !== overColumn.id) {
        moveCardToColumn(activeCard.id, overColumn.id, overColumn.cards.length);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveColumn(null);
    setActiveCard(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // 处理列排序
    if (activeData?.type === 'Column' && overData?.type === 'Column') {
      const activeColumn = activeData.column;
      const overColumn = overData.column;

      if (activeColumn.id !== overColumn.id) {
        const oldIndex = board.columns.findIndex((c) => c.id === activeColumn.id);
        const newIndex = board.columns.findIndex((c) => c.id === overColumn.id);

        const newColumns = arrayMove(board.columns, oldIndex, newIndex);
        const columnOrders = newColumns.map((col, index) => ({
          id: col.id,
          order: index,
        }));

        await updateColumnOrder(columnOrders);
        router.refresh();
      }
    }

    // 处理卡片排序
    if (activeData?.type === 'Card' && overData?.type === 'Card') {
      const activeCard = activeData.card;
      const overCard = overData.card;

      if (activeCard.columnId === overCard.columnId) {
        const column = board.columns.find((c) => c.id === activeCard.columnId);
        if (column) {
          const oldIndex = column.cards.findIndex((c) => c.id === activeCard.id);
          const newIndex = column.cards.findIndex((c) => c.id === overCard.id);

          const newCards = arrayMove(column.cards, oldIndex, newIndex);
          const cardOrders = newCards.map((card, index) => ({
            id: card.id,
            order: index,
          }));

          await updateCardOrder(cardOrders);
          router.refresh();
        }
      }
    }
  };

  const columnIds = board.columns.map((col) => col.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          {board.columns
            .sort((a, b) => a.order - b.order)
            .map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                boardId={board.id}
              />
            ))}
        </SortableContext>
      </div>

      <DragOverlay>
        {activeColumn && (
          <div className="bg-gray-100 rounded-lg p-4 min-w-[300px] opacity-80">
            <h3 className="font-semibold text-gray-700">{activeColumn.name}</h3>
          </div>
        )}
        {activeCard && <KanbanCard card={activeCard} />}
      </DragOverlay>
    </DndContext>
  );
}
