'use client';
import { AppData, Transaction, Category, User } from '@/types';
import { generateId } from './utils';

const STORAGE_KEY = 'my-account-data';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: '工资', type: 'INCOME', icon: 'wallet', color: '#16A34A' },
  { id: 'cat-2', name: '奖金', type: 'INCOME', icon: 'gift', color: '#2563EB' },
  { id: 'cat-3', name: '投资', type: 'INCOME', icon: 'trending-up', color: '#7C3AED' },
  { id: 'cat-4', name: '餐饮', type: 'EXPENSE', icon: 'utensils', color: '#DC2626' },
  { id: 'cat-5', name: '交通', type: 'EXPENSE', icon: 'bus', color: '#EA580C' },
  { id: 'cat-6', name: '购物', type: 'EXPENSE', icon: 'shopping-bag', color: '#DB2777' },
  { id: 'cat-7', name: '娱乐', type: 'EXPENSE', icon: 'gamepad-2', color: '#9333EA' },
  { id: 'cat-8', name: '住房', type: 'EXPENSE', icon: 'home', color: '#0D9488' },
  { id: 'cat-9', name: '医疗', type: 'EXPENSE', icon: 'heart-pulse', color: '#E11D48' },
  { id: 'cat-10', name: '教育', type: 'EXPENSE', icon: 'book-open', color: '#0284C7' },
];

function getInitialData(): AppData {
  if (typeof window === 'undefined') {
    return { user: null, transactions: [], categories: DEFAULT_CATEGORIES };
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial: AppData = { user: null, transactions: [], categories: DEFAULT_CATEGORIES };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.categories || parsed.categories.length === 0) {
      parsed.categories = DEFAULT_CATEGORIES;
    }
    return parsed;
  } catch {
    const initial: AppData = { user: null, transactions: [], categories: DEFAULT_CATEGORIES };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

function saveData(data: AppData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

// Singleton store
let storeInstance: ReturnType<typeof createStore> | null = null;

function createStore() {
  let data = getInitialData();
  let listeners: (() => void)[] = [];

  // FIX: copy array before iterating to avoid closure hazard during unsubscribe
  const notify = () => listeners.slice().forEach((l) => l());

  const api = {
    getData: () => data,
    subscribe: (cb: () => void) => {
      listeners.push(cb);
      return () => {
        listeners = listeners.filter((l) => l !== cb);
      };
    },
    setUser: (user: User | null) => {
      data = { ...data, user };
      saveData(data);
      notify();
    },
    addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
      const newTx: Transaction = { ...tx, id: generateId(), createdAt: new Date().toISOString() };
      data = { ...data, transactions: [newTx, ...data.transactions] };
      saveData(data);
      notify();
      return newTx;
    },
    updateTransaction: (id: string, tx: Partial<Transaction>) => {
      data = {
        ...data,
        transactions: data.transactions.map((t) => (t.id === id ? { ...t, ...tx } : t)),
      };
      saveData(data);
      notify();
    },
    deleteTransaction: (id: string) => {
      data = { ...data, transactions: data.transactions.filter((t) => t.id !== id) };
      saveData(data);
      notify();
    },
    addCategory: (cat: Omit<Category, 'id'>) => {
      const newCat: Category = { ...cat, id: generateId() };
      data = { ...data, categories: [...data.categories, newCat] };
      saveData(data);
      notify();
      return newCat;
    },
    deleteCategory: (id: string) => {
      data = { ...data, categories: data.categories.filter((c) => c.id !== id) };
      saveData(data);
      notify();
    },
    exportData: () => JSON.stringify(data, null, 2),
    importData: (json: string) => {
      const parsed = JSON.parse(json) as AppData;
      data = parsed;
      saveData(data);
      notify();
    },
    resetData: () => {
      data = { user: null, transactions: [], categories: DEFAULT_CATEGORIES };
      saveData(data);
      notify();
    },
  };

  return api;
}

export type Store = ReturnType<typeof createStore>;

export function getStore(): Store {
  if (!storeInstance) storeInstance = createStore();
  return storeInstance;
}
