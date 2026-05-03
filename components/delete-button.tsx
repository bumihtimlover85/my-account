'use client';
import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';

interface Props {
  action: () => Promise<void>;
}

export default function DeleteButton({ action }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => action())}
      disabled={isPending}
      className="p-1.5 rounded-md text-zinc-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-50"
      aria-label="删除"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
