import type { StateCreator } from 'zustand';
import { mockWallet, mockCheckInStreak } from '@/mocks/mockData';
import type { AppState, WalletSlice } from './types';

export const createWalletSlice: StateCreator<AppState, [], [], WalletSlice> = (set, get) => ({
  wallet: mockWallet,
  checkInStreak: mockCheckInStreak,

  claimDailyCheckIn: () => {
    const state = get();
    if (state.checkInStreak.todayClaimed) return false;

    const todayDay = state.checkInStreak.days.find((d) => d.isToday);
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
        currentStreak: s.checkInStreak.currentStreak + 1,
        lastCheckInDate: new Date().toISOString().split('T')[0],
        days: s.checkInStreak.days.map((d) => (d.isToday ? { ...d, claimed: true } : d)),
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
