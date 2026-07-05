'use client';

import { Board } from '@/types';
import { BoardCard } from './board-card';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface BoardListProps {
  boards: Board[];
}

export function BoardList({ boards }: BoardListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
      
      <Link
        href="/boards/new"
        className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <Plus className="h-5 w-5 text-gray-400" />
        <span className="text-gray-500">创建新看板</span>
      </Link>
    </div>
  );
}
