'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Board } from '@/types';
import { deleteBoard } from '@/app/actions';
import { MoreHorizontal, Trash2, Layout } from 'lucide-react';
import { useState } from 'react';

interface BoardCardProps {
  board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('确定要删除这个看板吗？')) return;
    
    setIsDeleting(true);
    const result = await deleteBoard(board.id);
    
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || '删除失败');
      setIsDeleting(false);
    }
  };

  const totalCards = board.columns?.reduce((sum, col) => sum + (col.cards?.length || 0), 0) || 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <Link href={`/boards/${board.id}`} className="block p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Layout className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{board.name}</h3>
              {board.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{board.description}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span>{board.columns?.length || 0} 列</span>
          <span>{totalCards} 卡片</span>
        </div>
      </Link>
      
      <div className="px-4 py-3 border-t flex justify-end">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? '删除中...' : '删除'}
        </button>
      </div>
    </div>
  );
}
