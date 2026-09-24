import type { StateCreator } from 'zustand';
import { getTodayDayIndex, getTodayDateString, VN_DAY_LABELS } from '@/lib/dateUtils';
import type { AppState, WalletSlice } from './types';

const createEmptyCheckInStreak = () => ({
  days: VN_DAY_LABELS.map((label, idx) => ({
    dayIndex: idx,
    dayLabel: label,
    reward: 10,
    claimed: false,
    isToday: idx === getTodayDayIndex(),
  })),
  currentStreak: 0,
  lastCheckInDate: null,
  todayClaimed: false,
});

export const createWalletSlice: StateCreator<AppState, [], [], WalletSlice> = (set, get) => ({
  wallet: { mainCoin: 0, bonusCoin: 0 },
  checkInStreak: createEmptyCheckInStreak(),

  syncCheckInStreak: () => {
    const todayIdx = getTodayDayIndex();
    const todayStr = getTodayDateString();
    set((s) => {
      const current = s.checkInStreak && s.checkInStreak.days.length > 0 ? s.checkInStreak : createEmptyCheckInStreak();
      const isTodayClaimed = current.lastCheckInDate === todayStr;
      const updatedDays = current.days.map((d, idx) => ({
        ...d,
        isToday: idx === todayIdx,
        claimed: idx < todayIdx ? true : idx === todayIdx ? isTodayClaimed : false,
      }));
      return {
        checkInStreak: {
          ...current,
          todayClaimed: isTodayClaimed,
          currentStreak: isTodayClaimed ? Math.max(current.currentStreak, todayIdx + 1) : Math.max(current.currentStreak, todayIdx),
          days: updatedDays,
        },
      };
    });
  },

  claimDailyCheckIn: () => {
    const state = get();
    const todayIdx = getTodayDayIndex();
    const todayStr = getTodayDateString();

    if (state.checkInStreak.lastCheckInDate === todayStr || state.checkInStreak.todayClaimed) {
      return false;
    }

    const todayDay =
      state.checkInStreak.days[todayIdx] ||
      state.checkInStreak.days.find((d) => d.isToday);
    if (!todayDay) return false;

    const reward = todayDay.reward;

    set((s) => ({
      wallet: {
        ...s.wallet,
        bonusCoin: s.wallet.bonusCoin + reward,
      },
      checkInStreak: {
        ...s.checkInStreak,
        todayClaimed: true,
        currentStreak: Math.max(s.checkInStreak.currentStreak, todayIdx + 1),
        lastCheckInDate: todayStr,
        days: s.checkInStreak.days.map((d, idx) =>
          idx === todayIdx || d.isToday ? { ...d, claimed: true, isToday: true } : d
        ),
      },
    }));

    // Also add a transaction
    get().addTransaction({
      type: 'checkin',
      typeLabel: 'Điểm danh',
      description: `Điểm danh nhận thưởng +${reward} Coin`,
      mainCoinDelta: 0,
      bonusCoinDelta: reward,
      totalAmount: reward,
      status: 'success',
      statusLabel: 'Thành công',
    });

    return true;
  },

  setWalletBalance: (main, bonus) =>
    set((s) => ({ wallet: { ...s.wallet, mainCoin: main, bonusCoin: bonus } })),

  isDepositModalOpen: false,
  openDepositModal: () => set({ isDepositModalOpen: true }),
  closeDepositModal: () => set({ isDepositModalOpen: false }),

  depositCoins: (amountVND, mainCoin, bonusCoin, method) => {
    set((s) => ({
      wallet: {
        mainCoin: s.wallet.mainCoin + mainCoin,
        bonusCoin: s.wallet.bonusCoin + bonusCoin,
      },
      isDepositModalOpen: false,
    }));

    get().addTransaction({
      type: 'deposit',
      typeLabel: 'Nạp Coin',
      description: `Nạp ${mainCoin + bonusCoin} Coin qua ${method} (${amountVND.toLocaleString('vi-VN')} đ)`,
      mainCoinDelta: mainCoin,
      bonusCoinDelta: bonusCoin,
      totalAmount: mainCoin + bonusCoin,
      status: 'success',
      statusLabel: 'Thành công',
    });
  },
});
