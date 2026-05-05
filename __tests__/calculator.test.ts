import { describe, it, expect } from 'vitest';
import { add, subtract, multiply, divide } from '@/lib/calculator';

describe('calculator', () => {
  describe('add', () => {
    it('adds two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('handles negative numbers', () => {
      expect(add(-2, -3)).toBe(-5);
      expect(add(-2, 3)).toBe(1);
    });

    it('handles floating point numbers', () => {
      expect(add(0.1, 0.2)).toBeCloseTo(0.3);
    });
  });

  describe('subtract', () => {
    it('subtracts two positive numbers', () => {
      expect(subtract(5, 3)).toBe(2);
    });

    it('handles negative results', () => {
      expect(subtract(3, 5)).toBe(-2);
    });
  });

  describe('multiply', () => {
    it('multiplies two positive numbers', () => {
      expect(multiply(4, 3)).toBe(12);
    });

    it('handles zero', () => {
      expect(multiply(99, 0)).toBe(0);
    });
  });

  describe('divide', () => {
    it('divides two positive numbers', () => {
      expect(divide(10, 2)).toBe(5);
    });

    it('throws on division by zero', () => {
      expect(() => divide(10, 0)).toThrow('Division by zero is not allowed');
    });

    it('handles floating point results', () => {
      expect(divide(1, 3)).toBeCloseTo(0.3333, 4);
    });
  });
});
