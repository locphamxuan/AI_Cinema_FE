import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/store/useAppStore';

describe('Zustand App Store (src/store/useAppStore.ts)', () => {
  beforeEach(() => {
    // Reset store state
    const store = useAppStore.getState();
    store.logout();
    store.setWalletBalance(120, 80);
  });

  describe('Dual Wallet & Coin Deduction', () => {
    it('initializes with default coin balance', () => {
      const state = useAppStore.getState();
      expect(state.wallet.mainCoin).toBe(120);
      expect(state.wallet.bonusCoin).toBe(80);
    });

    it('deducts from main coin first when unlocking episode', () => {
      const store = useAppStore.getState();
      store.setWalletBalance(100, 50);

      // ep-003 price is 50
      const res = store.unlockEpisode('ep-003');
      expect(res.success).toBe(true);
      expect(useAppStore.getState().wallet.mainCoin).toBe(50); // 100 - 50
      expect(useAppStore.getState().wallet.bonusCoin).toBe(50); // unchanged
    });

    it('splits deduction between main and bonus coin when main coin is insufficient', () => {
      const store = useAppStore.getState();
      store.setWalletBalance(20, 60); // total 80, price is 50

      const res = store.unlockEpisode('ep-004');
      expect(res.success).toBe(true);
      expect(useAppStore.getState().wallet.mainCoin).toBe(0);  // 20 - 20
      expect(useAppStore.getState().wallet.bonusCoin).toBe(30); // 60 - 30
    });

    it('fails when total coin is less than price', () => {
      const store = useAppStore.getState();
      store.setWalletBalance(10, 10); // total 20 < 50

      const res = store.unlockEpisode('ep-005');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Số dư không đủ');
    });
  });

  describe('Daily Check-in Streak', () => {
    it('claims daily reward and increments streak on first attempt', () => {
      const store = useAppStore.getState();
      const initialBonus = store.wallet.bonusCoin;
      
      // Ensure today is not claimed for test
      useAppStore.setState((s) => ({
        checkInStreak: {
          ...s.checkInStreak,
          todayClaimed: false,
          days: s.checkInStreak.days.map((d) => (d.isToday ? { ...d, claimed: false } : d)),
        },
      }));

      const success = store.claimDailyCheckIn();
      expect(success).toBe(true);
      expect(useAppStore.getState().checkInStreak.todayClaimed).toBe(true);
      expect(useAppStore.getState().wallet.bonusCoin).toBeGreaterThan(initialBonus);
    });

    it('prevents duplicate check-ins on the same day', () => {
      const store = useAppStore.getState();
      const success = store.claimDailyCheckIn();
      expect(success).toBe(false);
    });
  });

  describe('VIP Mode Toggle', () => {
    it('toggles VIP state correctly', () => {
      const store = useAppStore.getState();
      const initialVIP = store.isVIPMode;

      store.toggleVIPMode();
      expect(useAppStore.getState().isVIPMode).toBe(!initialVIP);

      store.toggleVIPMode();
      expect(useAppStore.getState().isVIPMode).toBe(initialVIP);
    });
  });
});
