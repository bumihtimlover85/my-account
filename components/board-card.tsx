'use client';

import { Board } from '@/types';
import Link from 'next/link';
import { MoreHorizontal, Calendar, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteBoard } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface BoardCardProps {
  board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('确定要删除这个看板吗？')) {
      setIsDeleting(true);
      await deleteBoard(board.id);
      router.refresh();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/boards/${board.id}`} className="flex-1">
            <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {board.name}
            </h3>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/boards/${board.id}/edit`}>编辑</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600"
              >
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {board.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {board.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(board.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{board.columns?.length || 0} 列</span>
          </div>
        </div>
      </div>
    </div>
  );
}
