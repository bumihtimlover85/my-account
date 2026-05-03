import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate, generateId } from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', true && 'active')).toBe('base active');
  });
});

describe('formatCurrency', () => {
  it('formats CNY with two decimals', () => {
    expect(formatCurrency(1234.5)).toBe('¥1,234.50');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('¥0.00');
  });
});

describe('formatDate', () => {
  it('formats ISO date to Chinese locale', () => {
    const result = formatDate('2024-06-15');
    expect(result).toContain('2024');
    expect(result).toContain('15');
  });
});

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('returns unique values', () => {
    const ids = new Set(Array.from({ length: 50 }, generateId));
    expect(ids.size).toBe(50);
  });
});
