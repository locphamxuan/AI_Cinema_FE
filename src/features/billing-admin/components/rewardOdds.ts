import type { RewardPrize } from '@/types/billing';

/** The BE limits for a prize: plan days 1–30, bonus Coins 1–100 000 (also a check-in day), "tỉ lệ trúng" points 1–10 000. */
export const MAX_PLAN_DAYS = 30;
export const MAX_REWARD_BONUS_COINS = 100_000;
export const MAX_WEIGHT = 10_000;

/** Chance of a prize, in percent: its weight over the weights of every active prize. */
export function chanceOf(prize: RewardPrize, prizes: RewardPrize[]): number {
  if (!prize.isActive) return 0;
  const total = prizes.filter((p) => p.isActive).reduce((sum, p) => sum + (p.weight ?? 0), 0);
  return total ? ((prize.weight ?? 0) / total) * 100 : 0;
}

/**
 * The chance a prize would get with `weight` points, next to the other active prizes. Used while
 * the Admin types, so the edited prize counts as active even when it is switched off right now.
 */
export function chanceWith(weight: number, prizes: RewardPrize[], selfId?: string): number {
  if (!Number.isFinite(weight) || weight <= 0) return 0;
  const others = prizes.filter((p) => p.isActive && p.id !== selfId).reduce((sum, p) => sum + (p.weight ?? 0), 0);
  return (weight / (others + weight)) * 100;
}

/** "12,5%": one decimal, Vietnamese comma, no trailing ",0". */
export function formatPercent(value: number): string {
  return `${(Math.round(value * 10) / 10).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;
}

/** What the prize pays, in plain words. */
export function prizeReward(prize: Pick<RewardPrize, 'type' | 'bonusCoins' | 'planDays'>): string {
  return prize.type === 'PLAN_DAYS' ? `${prize.planDays} ngày gói Tháng` : `${prize.bonusCoins} Coin thưởng`;
}
