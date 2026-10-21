import type { CoinEntryType } from '@/types/billing';

/** How a Coin ledger line reads to people, in the order the filters list them. */
export const COIN_ENTRY_LABEL: Record<CoinEntryType, string> = {
  TOP_UP: 'Nạp Coin',
  EPISODE_PURCHASE: 'Mua tập',
  PLAN_PAYMENT: 'Thanh toán gói',
  PLAN_RENEWAL: 'Gia hạn gói',
  DAILY_REWARD: 'Điểm danh',
  REWARD_SPIN: 'Vòng quay',
  SIGNUP_BONUS: 'Thưởng đăng ký',
  REFUND: 'Hoàn Coin',
  BONUS_EXPIRY: 'Coin thưởng hết hạn',
  ADJUSTMENT: 'Điều chỉnh',
};

export const COIN_ENTRY_TYPES = Object.keys(COIN_ENTRY_LABEL) as CoinEntryType[];

/** `+12` / `-5` / `-` for an amount on one counter. */
export const signed = (amount: number) => (amount === 0 ? '-' : `${amount > 0 ? '+' : ''}${amount.toLocaleString('vi-VN')}`);
