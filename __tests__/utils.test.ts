import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate, generateId } from '@/lib/utils';

describe('cn', () => {
  it('merges classes', () => {
    expect(cn('a', 'b')).toBe('a b');
  });
  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'block')).toBe('base block');
  });
});

describe('formatCurrency', () => {
  it('formats positive amount', () => {
    expect(formatCurrency(1234.56)).toMatch(/¥/);
    expect(formatCurrency(1234.56)).toMatch(/1,?234\.56/);
  });
  it('formats zero', () => {
    expect(formatCurrency(0)).toMatch(/0\.00/);
  });
});

describe('formatDate', () => {
  it('formats ISO date', () => {
    expect(formatDate('2024-06-15')).toMatch(/2024/);
    expect(formatDate('2024-06-15')).toMatch(/15/);
  });
});

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
  it('returns unique values', () => {
    const ids = new Set(Array.from({ length: 10 }, generateId));
    expect(ids.size).toBe(10);
  });
});
