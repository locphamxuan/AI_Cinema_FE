import type { BreakEvenStatus } from '@/types/finance';

const NUMBER = new Intl.NumberFormat('vi-VN');
const DAY = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });

/** "01/10/2026", the day in Vietnam. */
export function day(iso: string): string {
  return DAY.format(new Date(iso));
}

/** "1.500.000 VND" (the Financial Dashboard spells the currency out). */
export function vnd(n: number | null | undefined): string {
  return n === null || n === undefined ? '—' : `${NUMBER.format(n)} VND`;
}

/** "-20%"; "—" while there is nothing to divide by (no revenue). */
export function percent(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : `${NUMBER.format(value)}%`;
}

/** Green for a gain, red for a loss, plain for zero or nothing. */
export function signTone(n: number | null | undefined): string {
  if (n === null || n === undefined || n === 0) return '';
  return n > 0 ? 'text-success' : 'text-destructive';
}

export const BREAK_EVEN: Record<BreakEvenStatus, { label: string; tone: 'emerald' | 'amber' | 'neutral' }> = {
  BROKE_EVEN: { label: 'Đã hoà vốn', tone: 'emerald' },
  NOT_YET: { label: 'Chưa hoà vốn', tone: 'amber' },
  NO_COST: { label: 'Chưa có chi phí', tone: 'neutral' },
};

/** Rows `page` of a list the backend sends whole (sorted and searched here). */
export function pageOf<T>(rows: T[], page: number, size: number): T[] {
  return rows.slice((page - 1) * size, page * size);
}
