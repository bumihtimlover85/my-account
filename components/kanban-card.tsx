'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, PRIORITIES } from '@/types';

interface KanbanCardProps {
  card: Card;
  onClick: () => void;
}

export default function KanbanCard({ card, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const completedSubtasks = card.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = card.subtasks.length;
  const priority = PRIORITIES[card.priority as keyof typeof PRIORITIES];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border p-3 mb-2 cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900 flex-1">{card.title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${priority.color}`}>
          {priority.label}
        </span>
      </div>
      {card.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{card.description}</p>
      )}
      {totalSubtasks > 0 && (
        <div className="flex items-center gap-1">
          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all"
              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {completedSubtasks}/{totalSubtasks}
          </span>
        </div>
      )}
      {card.comments.length > 0 && (
        <div className="mt-2 text-xs text-gray-400">💬 {card.comments.length}</div>
      )}
    </div>
  );
}
