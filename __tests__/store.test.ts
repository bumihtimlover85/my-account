import { describe, it, expect, beforeEach } from 'vitest';
import { getStore, resetStore } from '@/lib/store';
import type { AppData } from '@/types';

describe('store', () => {
  beforeEach(() => {
    resetStore();
  });

  it('initializes with default categories', () => {
    const data = getStore().getData();
    expect(data.categories.length).toBeGreaterThan(0);
    expect(data.transactions).toEqual([]);
    expect(data.user).toBeNull();
  });

  it('adds and retrieves a transaction', () => {
    const store = getStore();
    const tx = store.addTransaction({
      amount: 100,
      type: 'EXPENSE',
      categoryId: 'cat-4',
      date: '2024-06-01',
      note: '午餐',
    });
    expect(tx.amount).toBe(100);
    expect(tx.type).toBe('EXPENSE');
    expect(store.getData().transactions.length).toBe(1);
  });

  it('deletes a transaction', () => {
    const store = getStore();
    const tx = store.addTransaction({
      amount: 50,
      type: 'EXPENSE',
      categoryId: 'cat-4',
      date: '2024-06-01',
      note: '',
    });
    store.deleteTransaction(tx.id);
    expect(store.getData().transactions).toEqual([]);
  });

  it('adds and deletes a category', () => {
    const store = getStore();
    const initialCount = store.getData().categories.length;
    const cat = store.addCategory({ name: '测试', type: 'EXPENSE', color: '#000', icon: 'circle' });
    expect(store.getData().categories.length).toBe(initialCount + 1);
    store.deleteCategory(cat.id);
    expect(store.getData().categories.length).toBe(initialCount);
  });

  it('notifies subscribers on change', () => {
    const store = getStore();
    let called = 0;
    const unsub = store.subscribe(() => {
      called++;
    });
    store.addTransaction({ amount: 10, type: 'EXPENSE', categoryId: 'cat-4', date: '2024-06-01', note: '' });
    expect(called).toBe(1);
    unsub();
  });

  it('allows unsubscribe without error during notify', () => {
    const store = getStore();
    const calls: number[] = [];
    const unsub1 = store.subscribe(() => {
      calls.push(1);
      unsub1();
    });
    const unsub2 = store.subscribe(() => {
      calls.push(2);
    });
    // Should not throw and still notify listener 2
    store.addTransaction({ amount: 10, type: 'EXPENSE', categoryId: 'cat-4', date: '2024-06-01', note: '' });
    expect(calls).toContain(2);
    unsub2();
  });

  it('exports and imports data', () => {
    const store = getStore();
    store.addTransaction({ amount: 99, type: 'INCOME', categoryId: 'cat-1', date: '2024-06-01', note: '' });
    const exported = store.exportData();
    const parsed = JSON.parse(exported) as AppData;
    expect(parsed.transactions.length).toBe(1);

    resetStore();
    const store2 = getStore();
    store2.importData(exported);
    expect(store2.getData().transactions.length).toBe(1);
  });
});
