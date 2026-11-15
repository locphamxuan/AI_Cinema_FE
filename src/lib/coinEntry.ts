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

// The ledger stores the BE's English notes; members read them in Vietnamese.
const DESCRIPTIONS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^Daily check-in, day (\d+) of the streak$/, (m) => `Điểm danh ngày ${m[1]} của chuỗi`],
  [/^Top-up (\w+)$/, (m) => `Nạp Coin qua ${m[1] === 'VNPAY' ? 'VNPay' : m[1]}`],
  [/^Reward spin: (.+)$/, (m) => `Vòng quay: ${m[1]}`],
  [/^Unlocked one episode$/, () => 'Mở khoá một tập phim'],
  [/^Bonus Coins of a new account$/, () => 'Coin thưởng cho tài khoản mới'],
  [/^Bonus Coins expired on (\d{4})-(\d{2})-(\d{2})$/, (m) => `Coin thưởng hết hạn ngày ${m[3]}/${m[2]}/${m[1]}`],
  [/^Refund: the content was taken down for good \((.+)\)$/, (m) => `Hoàn Coin: tập phim đã bị gỡ hẳn (${m[1]})`],
];

/** A ledger line's note in Vietnamese; notes the app does not know are shown as written. */
export function describeLine(description: string | null): string | null {
  if (!description) return null;
  for (const [pattern, render] of DESCRIPTIONS) {
    const match = description.match(pattern);
    if (match) return render(match);
  }
  return description;
}
