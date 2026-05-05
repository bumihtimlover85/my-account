import { describe, it, expect } from 'vitest';
import { add, subtract, multiply, divide } from '@/lib/calculator';

describe('calculator', () => {
  it('adds two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('subtracts two numbers', () => {
    expect(subtract(5, 3)).toBe(2);
  });

  it('multiplies two numbers', () => {
    expect(multiply(4, 3)).toBe(12);
  });

  it('divides two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });
});
