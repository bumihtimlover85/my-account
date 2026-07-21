export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: Date;
  user: { id: string; name: string; email: string };
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  position: number;
  projectId: string;
  subtasks: Subtask[];
  comments: Comment[];
}

export const COLUMNS = [
  { id: 'todo', title: '待办', color: '#10b981', borderColor: 'border-emerald-400', bg: 'bg-emerald-50/50 dark:bg-emerald-500/5' },
  { id: 'in_progress', title: '进行中', color: '#3b82f6', borderColor: 'border-blue-400', bg: 'bg-blue-50/50 dark:bg-blue-500/5' },
  { id: 'testing', title: '测试中', color: '#f59e0b', borderColor: 'border-amber-400', bg: 'bg-amber-50/50 dark:bg-amber-500/5' },
  { id: 'done', title: '已完成', color: '#8b5cf6', borderColor: 'border-violet-400', bg: 'bg-violet-50/50 dark:bg-violet-500/5' },
] as const;

export const PRIORITIES: Record<string, { label: string; color: string }> = {
  high: { label: '高', color: '#ef4444' },
  medium: { label: '中', color: '#f59e0b' },
  low: { label: '低', color: '#22c55e' },
};
