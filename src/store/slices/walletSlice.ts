import type { StateCreator } from 'zustand';
import { getTodayDateString } from '@/lib/dateUtils';
import { dailyRewardService } from '@/services/dailyRewardService';
import { rewardSpinService } from '@/services/rewardSpinService';
import type { AppState, WalletSlice } from './types';

const emptyCheckInStreak = () => ({ currentStreak: 0, lastCheckInDate: null, todayClaimed: false });

export const createWalletSlice: StateCreator<AppState, [], [], WalletSlice> = (set) => ({
  wallet: { mainCoin: 0, bonusCoin: 0 },
  checkInStreak: emptyCheckInStreak(),
  availableSpins: 0,

  setAvailableSpins: (spins) => set({ availableSpins: spins }),

  /** The BE is the only judge of today's check-in and of the spins left; a cached flag may be a day or an account old. */
  syncRewards: async () => {
    const [daily, wheel] = await Promise.all([dailyRewardService.getStatus(), rewardSpinService.getWheelStatus()]);
    set((s) => ({
      ...(daily.success && daily.data
        ? {
            checkInStreak: {
              currentStreak: daily.data.streakDay,
              lastCheckInDate: daily.data.checkedInToday ? getTodayDateString() : null,
              todayClaimed: daily.data.checkedInToday,
            },
          }
        : {}),
      availableSpins: wheel.success && wheel.data ? wheel.data.availableSpins : s.availableSpins,
    }));
  },

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
