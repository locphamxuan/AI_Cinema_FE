import { CheckInStreak, WalletState } from '@/types/wallet';
import { getTodayDayIndex, VN_DAY_LABELS } from '@/lib/dateUtils';

// ====== WALLET MOCK ======
export const mockWallet: WalletState = {
  mainCoin: 120,
  bonusCoin: 80,
};

export const mockWalletLow: WalletState = {
  mainCoin: 15,
  bonusCoin: 10,
};

// ====== CHECK-IN STREAK ======
export const DEFAULT_CHECK_IN_REWARDS = [5, 5, 10, 5, 5, 15, 20];

export function getInitialCheckInStreak(): CheckInStreak {
  const todayIdx = getTodayDayIndex();
  return {
    days: VN_DAY_LABELS.map((dayLabel, idx) => ({
      dayIndex: idx,
      dayLabel,
      reward: DEFAULT_CHECK_IN_REWARDS[idx],
      claimed: idx < todayIdx,
      isToday: idx === todayIdx,
    })),
    currentStreak: todayIdx,
    lastCheckInDate: null,
    todayClaimed: false,
  };
}

export const mockCheckInStreak: CheckInStreak = getInitialCheckInStreak();
