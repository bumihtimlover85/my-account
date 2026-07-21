export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  cardId: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  cardId: string;
  createdAt: Date;
  user: User;
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  position: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  subtasks: Subtask[];
  comments: Comment[];
}

export const COLUMNS = [
  { id: 'todo', title: '待办', color: 'bg-brand-50 dark:bg-brand-900/20', borderColor: 'border-brand-200 dark:border-brand-800', icon: 'Circle' },
  { id: 'in_progress', title: '进行中', color: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-800', icon: 'Play' },
  { id: 'testing', title: '测试中', color: 'bg-amber-50 dark:bg-amber-900/20', borderColor: 'border-amber-200 dark:border-amber-800', icon: 'Bug' },
  { id: 'done', title: '已完成', color: 'bg-emerald-50 dark:bg-emerald-900/20', borderColor: 'border-emerald-200 dark:border-emerald-800', icon: 'CheckCircle' },
] as const;

export const PRIORITIES = {
  high: { label: '高', color: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' },
  medium: { label: '中', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
  low: { label: '低', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
} as const;
