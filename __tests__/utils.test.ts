import { describe, it, expect } from 'vitest';
import { COLUMNS, PRIORITIES } from '@/types';

describe('Types', () => {
  it('should have 4 kanban columns', () => {
    expect(COLUMNS).toHaveLength(4);
    expect(COLUMNS.map(c => c.id)).toEqual(['todo', 'in_progress', 'testing', 'done']);
  });

  it('should have 3 priority levels', () => {
    expect(Object.keys(PRIORITIES)).toHaveLength(3);
    expect(Object.keys(PRIORITIES)).toEqual(['high', 'medium', 'low']);
  });
});
