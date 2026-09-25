import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/store/useAppStore';
import type { Episode, Movie } from '@/types/movie';

const paidEpisode = (n: number): Episode => ({
  id: `ep-00${n}`,
  episodeNumber: n,
  title: `Tập ${n}`,
  duration: '25:00',
  hlsUrl: '',
  qualities: [],
  subtitles: [],
  thumbnailUrl: '',
  price: 50,
  isFree: false,
  isPreview: false,
  isUnlocked: false,
  synopsis: '',
});

const fixtureMovie: Movie = {
  id: 'movie-fixture',
  title: 'Phim thử nghiệm',
  genre: [],
  posterUrl: '',
  bannerUrl: '',
  description: '',
  year: 2026,
  totalEpisodes: 3,
  episodes: [3, 4, 5].map(paidEpisode),
  aiCompliance: { complianceArticle: '', reviewStatus: 'approved', contentRating: '', disclaimer: '' },
};

describe('Zustand App Store (src/store/useAppStore.ts)', () => {
  beforeEach(() => {
    const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    const store = useAppStore.getState();
    store.logout();
    store.setWalletBalance(0, 0);
    useAppStore.setState({
      chatMessages: [],
      currentMovie: fixtureMovie,
      movies: [fixtureMovie],
      checkInStreak: {
        days: Array.from({ length: 7 }, (_, idx) => ({
          dayIndex: idx,
          dayLabel: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][idx],
          reward: 10,
          claimed: idx < todayIdx,
          isToday: idx === todayIdx,
        })),
        currentStreak: 0,
        lastCheckInDate: null,
        todayClaimed: false,
      },
    });
  });

  describe('Dual Wallet & Coin Deduction', () => {
    it('starts with API-ready empty state instead of seeded mock data', () => {
      const state = useAppStore.getState();
      expect(state.wallet.mainCoin).toBe(0);
      expect(state.wallet.bonusCoin).toBe(0);
      expect(state.chatMessages).toEqual([]);
      expect(state.checkInStreak.currentStreak).toBe(0);
    });

    it('initializes with default coin balance', () => {
      const store = useAppStore.getState();
      store.setWalletBalance(120, 80);
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
      const first = store.claimDailyCheckIn();
      expect(first).toBe(true);

      const second = store.claimDailyCheckIn();
      expect(second).toBe(false);
    });

    it('maintains todayClaimed after store sync / page reload simulation', () => {
      const store = useAppStore.getState();
      expect(store.claimDailyCheckIn()).toBe(true);
      expect(useAppStore.getState().checkInStreak.todayClaimed).toBe(true);

      // Simulate F5 page refresh sync
      store.syncCheckInStreak();
      expect(useAppStore.getState().checkInStreak.todayClaimed).toBe(true);

      // Cannot claim again
      const success = useAppStore.getState().claimDailyCheckIn();
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
