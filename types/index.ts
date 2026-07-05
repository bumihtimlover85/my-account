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
  { id: 'todo', title: '待办', color: 'bg-gray-100' },
  { id: 'in_progress', title: '进行中', color: 'bg-blue-100' },
  { id: 'testing', title: '测试中', color: 'bg-yellow-100' },
  { id: 'done', title: '已完成', color: 'bg-green-100' },
] as const;

export const PRIORITIES = {
  high: { label: '高', color: 'text-red-600 bg-red-50' },
  medium: { label: '中', color: 'text-yellow-600 bg-yellow-50' },
  low: { label: '低', color: 'text-green-600 bg-green-50' },
} as const;
