import { CheckInStreak, WalletState } from '@/types/wallet';

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
// Today is Sunday (index 6), days 0-2 claimed, 3-5 missed, 6 = today not claimed
export const mockCheckInStreak: CheckInStreak = {
  days: [
    { dayIndex: 0, dayLabel: 'T2', reward: 5, claimed: true, isToday: false },
    { dayIndex: 1, dayLabel: 'T3', reward: 5, claimed: true, isToday: false },
    { dayIndex: 2, dayLabel: 'T4', reward: 10, claimed: true, isToday: false },
    { dayIndex: 3, dayLabel: 'T5', reward: 5, claimed: false, isToday: false },
    { dayIndex: 4, dayLabel: 'T6', reward: 5, claimed: false, isToday: false },
    { dayIndex: 5, dayLabel: 'T7', reward: 15, claimed: false, isToday: false },
    { dayIndex: 6, dayLabel: 'CN', reward: 20, claimed: false, isToday: true },
  ],
  currentStreak: 3,
  lastCheckInDate: '2026-09-03',
  todayClaimed: false,
};
