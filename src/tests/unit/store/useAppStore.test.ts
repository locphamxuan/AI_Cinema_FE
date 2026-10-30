import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@/store/useAppStore';
import { planIsRunning } from '@/store/slices/accountSlice';
import { mockApi } from '@/tests/support/mockApi';
import type { MySubscription } from '@/types/episodeAccess';
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
    const store = useAppStore.getState();
    store.logout();
    useAppStore.setState({
      currentMovie: fixtureMovie,
      movies: [fixtureMovie],
      checkInStreak: { currentStreak: 0, lastCheckInDate: null, todayClaimed: false },
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  describe('Dual wallet', () => {
    it('starts with API-ready empty state instead of seeded mock data', () => {
      const state = useAppStore.getState();
      expect(state.wallet).toEqual({ mainCoin: 0, bonusCoin: 0 });
      expect(state.checkInStreak.currentStreak).toBe(0);
      expect(state.isVIPMode).toBe(false);
    });

    it('shows the balance the BE answered', () => {
      useAppStore.getState().setWalletBalance(120, 80);
      expect(useAppStore.getState().wallet).toEqual({ mainCoin: 120, bonusCoin: 80 });
    });

    it('flags an episode the BE granted without touching the wallet', () => {
      useAppStore.getState().setWalletBalance(10, 5);
      useAppStore.getState().markEpisodeUnlocked('ep-003');
      expect(useAppStore.getState().currentMovie?.episodes[0].isUnlocked).toBe(true);
      expect(useAppStore.getState().wallet).toEqual({ mainCoin: 10, bonusCoin: 5 });
    });
  });

  describe('Daily check-in flag', () => {
    it('keeps today flagged after a reload and drops it on a later day', () => {
      useAppStore.getState().markCheckedInToday(3);
      useAppStore.getState().syncCheckInStreak();
      expect(useAppStore.getState().checkInStreak).toMatchObject({ todayClaimed: true, currentStreak: 3 });

      useAppStore.setState({ checkInStreak: { currentStreak: 3, lastCheckInDate: '2000-01-01', todayClaimed: true } });
      useAppStore.getState().syncCheckInStreak();
      expect(useAppStore.getState().checkInStreak.todayClaimed).toBe(false);
    });
  });

  describe('Rewards sync (check-in + spins from the BE)', () => {
    const daily = (checkedInToday: boolean, streakDay: number) => ({
      checkedInToday,
      streakDay,
      availableSpins: 2,
      reward: { streakDay: streakDay + 1, bonusCoins: 5, grantsSpin: false },
      ladder: [],
    });

    it('takes today and the spins left from the BE, not from the cached flag', async () => {
      useAppStore.setState({ checkInStreak: { currentStreak: 9, lastCheckInDate: '2000-01-01', todayClaimed: true } });
      mockApi({
        'GET /daily-rewards/status': daily(false, 3),
        'GET /rewards/spins': { availableSpins: 2, prizes: [], history: [] },
      });
      await useAppStore.getState().syncRewards();
      expect(useAppStore.getState().checkInStreak).toEqual({ currentStreak: 3, lastCheckInDate: null, todayClaimed: false });
      expect(useAppStore.getState().availableSpins).toBe(2);
    });

    it('keeps what it knew when the BE does not answer, and forgets it on logout', async () => {
      useAppStore.setState({ availableSpins: 4 });
      mockApi({});
      await useAppStore.getState().syncRewards();
      expect(useAppStore.getState().availableSpins).toBe(4);
      useAppStore.getState().logout();
      expect(useAppStore.getState().availableSpins).toBe(0);
    });
  });

  describe('Account sync (wallet + monthly plan from the BE)', () => {
    const plan = (status: string, currentPeriodEnd: string) => ({
      id: 'sub-1',
      status,
      autoRenew: true,
      priceCoins: 900,
      currentPeriodStart: '2026-10-01T00:00:00.000Z',
      currentPeriodEnd,
      nextRenewalAt: null,
      cancelDeadline: null,
      plan: { id: 'p', code: 'MONTHLY', name: 'Gói Tháng', durationDays: 30 },
    });
    const future = new Date(Date.now() + 86_400_000).toISOString();

    it('opens every episode only while the plan is ACTIVE and paid for', async () => {
      mockApi({
        'GET /wallet': { mainBalance: 40, bonusBalance: 12, version: 1, expiringBonus: [] },
        'GET /subscriptions/me': plan('ACTIVE', future),
      });
      await useAppStore.getState().syncAccount();
      expect(useAppStore.getState().wallet).toEqual({ mainCoin: 40, bonusCoin: 12 });
      expect(useAppStore.getState().isVIPMode).toBe(true);
    });

    it('treats a past-due or unpaid plan as no plan', () => {
      expect(planIsRunning(plan('PAST_DUE', future) as MySubscription)).toBe(false);
      expect(planIsRunning(plan('PENDING', future) as MySubscription)).toBe(false);
      expect(planIsRunning(plan('ACTIVE', '2000-01-01T00:00:00.000Z') as MySubscription)).toBe(false);
      expect(planIsRunning(null)).toBe(false);
    });

    it('clears the plan and the wallet on logout', async () => {
      useAppStore.setState({ isVIPMode: true, wallet: { mainCoin: 5, bonusCoin: 5 } });
      useAppStore.getState().logout();
      expect(useAppStore.getState()).toMatchObject({ isVIPMode: false, wallet: { mainCoin: 0, bonusCoin: 0 } });
    });
  });
});
