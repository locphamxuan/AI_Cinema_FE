import type { StateCreator } from 'zustand';
import { getTodayDateString } from '@/lib/dateUtils';
import type { AppState, WalletSlice } from './types';

const emptyCheckInStreak = () => ({ currentStreak: 0, lastCheckInDate: null, todayClaimed: false });

export const createWalletSlice: StateCreator<AppState, [], [], WalletSlice> = (set) => ({
  wallet: { mainCoin: 0, bonusCoin: 0 },
  checkInStreak: emptyCheckInStreak(),

  /** A check-in recorded on an earlier day no longer counts as today's. */
  syncCheckInStreak: () =>
    set((s) => {
      const current = s.checkInStreak ?? emptyCheckInStreak();
      return { checkInStreak: { ...current, todayClaimed: current.lastCheckInDate === getTodayDateString() } };
    }),

  markCheckedInToday: (streakDay) =>
    set((s) => ({
      checkInStreak: {
        ...s.checkInStreak,
        todayClaimed: true,
        currentStreak: streakDay,
        lastCheckInDate: getTodayDateString(),
      },
    })),

  setWalletBalance: (main, bonus) =>
    set((s) => ({ wallet: { ...s.wallet, mainCoin: main, bonusCoin: bonus } })),

  isDepositModalOpen: false,
  openDepositModal: () => set({ isDepositModalOpen: true }),
  closeDepositModal: () => set({ isDepositModalOpen: false }),
});
