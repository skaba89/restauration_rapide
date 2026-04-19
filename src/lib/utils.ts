import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// Safe Math Utilities - Prevent NaN, Infinity, and crashes
// ============================================

/**
 * Safe division - returns fallback when denominator is 0, undefined, or NaN.
 */
export function safeDivide(numerator: number, denominator: number, fallback: number = 0): number {
  if (typeof numerator !== 'number' || typeof denominator !== 'number') return fallback;
  if (!Number.isFinite(denominator) || denominator === 0) return fallback;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : fallback;
}

/**
 * Safe percentage calculation (0-100 range).
 */
export function safePercent(numerator: number, denominator: number, fallback: number = 0): number {
  return safeDivide(numerator, denominator, fallback) * 100;
}

/**
 * Safe toFixed - returns '0' string when value is NaN/undefined/null.
 */
export function safeToFixed(value: unknown, decimals: number = 1): string {
  const num = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return num.toFixed(decimals);
}

/**
 * Safe number extraction - returns fallback for NaN, undefined, null.
 */
export function safeNumber(value: unknown, fallback: number = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return fallback;
}
