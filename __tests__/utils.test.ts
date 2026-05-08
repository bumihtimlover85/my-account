import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate, generateId } from '@/lib/utils';

// ─── cn ───────────────────────────────────────────────────────────────────
describe('cn', () => {
  // ✅ already covered: empty input
  it('merges classes', () => {
    expect(cn('a', 'b')).toBe('a b');
  });
  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'block')).toBe('base block');
  });

  // 🆕 空输入
  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  // 🆕 单个字符串
  it('handles single string', () => {
    expect(cn('px-4')).toBe('px-4');
  });

  // 🆕 合并冲突的 Tailwind 类
  it('merges conflicting Tailwind classes (last wins)', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2');
  });

  // 🆕 undefined / null 值过滤
  it('filters out undefined', () => {
    expect(cn('a', undefined, 'b')).toBe('a b');
  });
  it('filters out null', () => {
    expect(cn('a', null, 'b')).toBe('a b');
  });
  it('filters out mixed undefined and null', () => {
    expect(cn(undefined, 'a', null, 'b', undefined)).toBe('a b');
  });

  // 🆕 数组解构输入
  it('handles array input', () => {
    expect(cn(['a', 'b'])).toBe('a b');
  });
  it('handles nested array input', () => {
    expect(cn(['a', ['b', 'c']])).toBe('a b c');
  });
  it('handles mixed array with conditional values', () => {
    expect(cn('base', [false && 'hidden', 'block'])).toBe('base block');
  });
});

// ─── formatCurrency ──────────────────────────────────────────────────────
describe('formatCurrency', () => {
  // ✅ 已有
  it('formats positive amount', () => {
    expect(formatCurrency(1234.56)).toMatch(/¥/);
    expect(formatCurrency(1234.56)).toMatch(/1,?234\.56/);
  });
  it('formats zero', () => {
    expect(formatCurrency(0)).toMatch(/0\.00/);
  });

  // 🆕 负数
  it('formats negative amount', () => {
    const result = formatCurrency(-500);
    expect(result).toMatch(/-/);
    expect(result).toMatch(/500\.00/);
  });

  // 🆕 极大金额
  it('formats very large amount', () => {
    const result = formatCurrency(9999999999.99);
    expect(result).toMatch(/¥/);
    expect(result).toContain('9');
  });

  // 🆕 小数精度不足时补零
  it('pads decimal to minimum fraction digits', () => {
    const result = formatCurrency(123.4);
    expect(result).toMatch(/123\.40/);
  });

  // 🆕 极小正数
  it('formats very small positive amount', () => {
    const result = formatCurrency(0.01);
    expect(result).toMatch(/0\.01/);
  });

  // 🆕 NaN 输入（Intl.NumberFormat 不会抛异常，返回包含 "NaN" 的字符串）
  it('handles NaN gracefully', () => {
    const result = formatCurrency(NaN);
    expect(result).toContain('NaN');
  });

  // 🆕 Infinity 输入
  it('handles Infinity gracefully', () => {
    const result = formatCurrency(Infinity);
    // Intl.NumberFormat 将 Infinity 格式化为 ∞ 符号
    expect(typeof result).toBe('string');
  });
});

// ─── formatDate ──────────────────────────────────────────────────────────
describe('formatDate', () => {
  // ✅ 已有
  it('formats ISO date', () => {
    expect(formatDate('2024-06-15')).toMatch(/2024/);
    expect(formatDate('2024-06-15')).toMatch(/15/);
  });

  // 🆕 不同格式输入：YYYY/MM/DD
  it('formats date with slashes', () => {
    const result = formatDate('2024/06/15');
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/15/);
  });

  // 🆕 不同格式输入：带时间的 ISO 字符串
  it('formats ISO datetime string', () => {
    const result = formatDate('2024-06-15T10:30:00Z');
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/15/);
  });

  // 🆕 无效日期字符串
  it('handles invalid date string', () => {
    const result = formatDate('abc');
    expect(result).toBe('Invalid Date');
  });

  // 🆕 空字符串
  it('handles empty string', () => {
    const result = formatDate('');
    expect(result).toBe('Invalid Date');
  });

  // 🆕 边界日期：Unix 纪元
  it('formats Unix epoch boundary', () => {
    const result = formatDate('1970-01-01');
    expect(result).toMatch(/1970/);
  });

  // 🆕 边界日期：9999 年
  it('formats far future boundary', () => {
    const result = formatDate('9999-12-31');
    expect(result).toMatch(/9999/);
    expect(result).toMatch(/31/);
  });
});

// ─── generateId ──────────────────────────────────────────────────────────
describe('generateId', () => {
  // ✅ 已有
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
  it('returns unique values', () => {
    const ids = new Set(Array.from({ length: 10 }, generateId));
    expect(ids.size).toBe(10);
  });

  // 🆕 长度验证：应在 20–30 字符范围内
  it('has stable length within expected range', () => {
    const ids = Array.from({ length: 100 }, generateId);
    for (const id of ids) {
      expect(id.length).toBeGreaterThanOrEqual(20);
      expect(id.length).toBeLessThanOrEqual(30);
    }
  });

  // 🆕 字符集验证：只含 [a-z0-9]
  it('contains only lowercase alphanumeric characters', () => {
    const ids = Array.from({ length: 100 }, generateId);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9]+$/);
    }
  });
});
