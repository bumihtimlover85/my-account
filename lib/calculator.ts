/**
 * 基础计算器工具函数
 */

/**
 * 两数相加
 * @param a - 被加数
 * @param b - 加数
 * @returns 和
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * 两数相减
 * @param a - 被减数
 * @param b - 减数
 * @returns 差
 */
export function subtract(a: number, b: number): number {
  return a - b;
}

/**
 * 两数相乘
 * @param a - 被乘数
 * @param b - 乘数
 * @returns 积
 */
export function multiply(a: number, b: number): number {
  return a * b;
}

/**
 * 两数相除
 * @param a - 被除数
 * @param b - 除数
 * @returns 商
 * @throws 当除数为零时抛出 Error
 */
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }
  return a / b;
}
