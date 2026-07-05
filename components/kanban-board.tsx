'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { CardDetail } from './card-detail';
import { Board, Card, Column as ColumnType } from '@/types';
import { updateCardsOrder, updateColumnsOrder, moveCard } from '@/app/actions';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  board: Board;
}

export function KanbanBoard({ board: initialBoard }: KanbanBoardProps) {
  const [board, setBoard] = useState(initialBoard);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumn = useCallback(
    (columnId: string | undefined) => {
      if (!columnId) return null;
      return board.columns.find((col) => col.id === columnId) || null;
    },
    [board.columns]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const card = board.columns
      .flatMap((col) => col.cards)
      .find((card) => card.id === active.id);
    if (card) {
      setActiveCard(card);
    }
  }, [board.columns]);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeColumn = board.columns.find((col) =>
        col.cards.some((card) => card.id === activeId)
      );
      const overColumn = board.columns.find(
        (col) => col.id === overId || col.cards.some((card) => card.id === overId)
      );

      if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
        return;
      }

      // 只在状态中更新，不调用 server action
      setBoard((prevBoard) => {
        const newColumns = prevBoard.columns.map((col) => {
          if (col.id === activeColumn.id) {
            return {
              ...col,
              cards: col.cards.filter((card) => card.id !== activeId),
            };
          }
          if (col.id === overColumn.id) {
            const activeCard = activeColumn.cards.find(
              (card) => card.id === activeId
            );
            if (!activeCard) return col;

            const overIndex = overColumn.cards.findIndex(
              (card) => card.id === overId
            );
            const insertIndex = overIndex >= 0 ? overIndex : overColumn.cards.length;

            return {
              ...col,
              cards: [
                ...col.cards.slice(0, insertIndex),
                activeCard,
                ...col.cards.slice(insertIndex),
              ],
            };
          }
          return col;
        });

        return { ...prevBoard, columns: newColumns };
      });
    },
    [board.columns]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) {
        setActiveCard(null);
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeColumn = board.columns.find((col) =>
        col.cards.some((card) => card.id === activeId)
      );
      const overColumn = board.columns.find(
        (col) => col.id === overId || col.cards.some((card) => card.id === overId)
      );

      if (!activeColumn || !overColumn) {
        setActiveCard(null);
        return;
      }

      // 同列内排序
      if (activeColumn.id === overColumn.id) {
        const oldIndex = activeColumn.cards.findIndex((c) => c.id === activeId);
        const newIndex = overColumn.cards.findIndex((c) => c.id === overId);

        if (oldIndex !== newIndex) {
          const newCards = arrayMove(activeColumn.cards, oldIndex, newIndex);
          const updatedColumns = board.columns.map((col) =>
            col.id === activeColumn.id ? { ...col, cards: newCards } : col
          );
          setBoard({ ...board, columns: updatedColumns });

          // 批量更新卡片顺序
          await updateCardsOrder(
            newCards.map((card, index) => ({
              id: card.id,
              position: index,
              columnId: activeColumn.id,
            }))
          );
        }
      } else {
        // 跨列移动 - 已在 handleDragOver 中更新了状态
        // 计算目标列中的新位置
        const overIndex = overColumn.cards.findIndex((c) => c.id === overId);
        const finalPosition = overIndex >= 0 ? overIndex : overColumn.cards.length - 1;

        await moveCard(activeId, overColumn.id, finalPosition);
      }

      setActiveCard(null);
    },
    [board]
  );

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;
    
    const { createColumn } = await import('@/app/actions');
    const result = await createColumn({ name: newColumnName, boardId: board.id });
    
    if (result.success && result.column) {
      setBoard({
        ...board,
        columns: [...board.columns, { ...result.column, cards: [] }],
      });
      setNewColumnName('');
      setIsAddingColumn(false);
    }
  };

  const handleColumnDeleted = (columnId: string) => {
    setBoard({
      ...board,
      columns: board.columns.filter((col) => col.id !== columnId),
    });
  };

  const handleCardAdded = (columnId: string, card: Card) => {
    setBoard({
      ...board,
      columns: board.columns.map((col) =>
        col.id === columnId ? { ...col, cards: [...col.cards, card] } : col
      ),
    });
  };

  const handleCardUpdated = (updatedCard: Card) => {
    setBoard({
      ...board,
      columns: board.columns.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === updatedCard.id ? updatedCard : card
        ),
      })),
    });
  };

  const handleCardDeleted = (cardId: string) => {
    setBoard({
      ...board,
      columns: board.columns.map((col) => ({
        ...col,
        cards: col.cards.filter((card) => card.id !== cardId),
      })),
    });
  };

  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {board.columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onColumnDeleted={handleColumnDeleted}
              onCardAdded={handleCardAdded}
              onCardClick={setSelectedCard}
            />
          ))}

          <DragOverlay>
            {activeCard ? (
              <KanbanCard card={activeCard} isDragging />
            ) : null}
          </DragOverlay>
        </DndContext>

        <div className="flex-shrink-0">
          {isAddingColumn ? (
            <div className="w-72 bg-gray-100 rounded-lg p-4">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="列名称"
                className="w-full px-3 py-2 border rounded-lg mb-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddColumn();
                  if (e.key === 'Escape') {
                    setIsAddingColumn(false);
                    setNewColumnName('');
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddColumn}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  添加
                </button>
                <button
                  onClick={() => {
                    setIsAddingColumn(false);
                    setNewColumnName('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="w-72 flex items-center justify-center gap-2 p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus className="h-5 w-5 text-gray-500" />
              <span className="text-gray-500">添加列</span>
            </button>
          )}
        </div>
      </div>

      {selectedCard && (
        <CardDetail
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onCardUpdated={handleCardUpdated}
          onCardDeleted={handleCardDeleted}
        />
      )}
    </>
  );
}
