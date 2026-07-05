export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  cardId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  cardId: string;
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  columnId: string;
  priority: Priority;
  assigneeId?: string | null;
  subtasks: Subtask[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  name: string;
  position: number;
  boardId: string;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Board {
  id: string;
  name: string;
  description?: string | null;
  userId: string;
  columns: Column[];
  createdAt: Date;
  updatedAt: Date;
}
