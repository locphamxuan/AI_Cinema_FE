import type { RewardPrize } from '@/types/billing';

/** The BE limits for a prize: plan days 1–30, bonus Coins 1–100 000 (also a check-in day). */
export const MAX_PLAN_DAYS = 30;
export const MAX_REWARD_BONUS_COINS = 100_000;

/**
 * A prize `weight` is its chance in basis points: 1 = 0,01 %, 10 000 = 100 %. Every spin wins exactly one prize,
 * so the prizes switched on must add up to 10 000 (or none is on).
 */
export const FULL_WHEEL = 10_000;

/** "12,5" or "12.5" typed by the Admin → 1250 basis points; null unless 0,01–100 with at most 2 decimals. */
export function parsePercent(text: string): number | null {
  const value = text.trim().replace(',', '.');
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(value)) return null;
  const basisPoints = Math.round(Number(value) * 100);
  return basisPoints >= 1 && basisPoints <= FULL_WHEEL ? basisPoints : null;
}

/** 1250 → "12,5" (for an input box). */
export const percentInput = (basisPoints: number) => (basisPoints / 100).toLocaleString('vi-VN', { maximumFractionDigits: 2 });

/** 1250 → "12,5%". */
export const formatChance = (basisPoints: number) => `${percentInput(basisPoints)}%`;

/** Sum of the prizes switched on, with `changes` (id → new weight, or null = switched off) applied first. */
export function activeTotal(prizes: RewardPrize[], changes: Record<string, number | null> = {}): number {
  return prizes.reduce((sum, p) => {
    const next = p.id in changes ? changes[p.id] : p.isActive ? (p.weight ?? 0) : null;
    return sum + (next ?? 0);
  }, 0);
}

/** Null when the wheel adds up (exactly 100 %, or empty), else what is missing or over, in plain words. */
export function totalProblem(total: number, anyOn = total > 0): string | null {
  if (!anyOn || total === FULL_WHEEL) return null;
  return total < FULL_WHEEL ? `còn thiếu ${formatChance(FULL_WHEEL - total)}` : `thừa ${formatChance(total - FULL_WHEEL)}`;
}

/** Splits 100 % evenly between `count` prizes, the first ones taking the leftover basis points. */
export function evenSplit(count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(FULL_WHEEL / count);
  return Array.from({ length: count }, (_, i) => base + (i < FULL_WHEEL - base * count ? 1 : 0));
}

/** What the prize pays, in plain words. */
export function prizeReward(prize: Pick<RewardPrize, 'type' | 'bonusCoins' | 'planDays'>): string {
  return prize.type === 'PLAN_DAYS' ? `${prize.planDays} ngày gói Tháng` : `${prize.bonusCoins} Coin thưởng`;
}
