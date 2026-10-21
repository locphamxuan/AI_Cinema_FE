import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DailyCheckInModal from '@/components/wallet/DailyCheckInModal';
import { useAppStore } from '@/store/useAppStore';
import { mockApi } from '@/tests/support/mockApi';

const ladder = Array.from({ length: 7 }, (_, i) => ({ streakDay: i + 1, bonusCoins: 5, grantsSpin: i === 6 }));
const status = (checkedInToday: boolean, streakDay: number) => ({
  checkInDate: '2026-10-16',
  checkedInToday,
  streakDay,
  streakContinued: false,
  reward: { streakDay: (streakDay % 7) + 1, bonusCoins: 5, grantsSpin: false },
  ladder,
  availableSpins: 1,
  mainBalance: 0,
  bonusBalance: 0,
  expiringBonus: [],
});

describe('DailyCheckInModal ladder', () => {
  beforeEach(() => {
    useAppStore.setState({ isAuthenticated: true, isCheckInModalOpen: true });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    useAppStore.setState({ isCheckInModalOpen: false });
  });

  it('starts a new round on day 1 once day 7 was claimed yesterday', async () => {
    mockApi({ 'GET /daily-rewards/status': status(false, 7) });
    render(<DailyCheckInModal />);
    await screen.findByRole('button', { name: /Nhận 5 Coin Thưởng/ });
    expect(screen.queryAllByText('✅')).toHaveLength(0);
    // Day 1 is the next one to claim, days 2-6 are locked and day 7 carries the spin.
    expect(screen.getAllByText('🎁')).toHaveLength(1);
    expect(screen.getAllByText('🔒')).toHaveLength(5);
  });

  it('marks the days already claimed in the current round', async () => {
    mockApi({ 'GET /daily-rewards/status': status(false, 2) });
    render(<DailyCheckInModal />);
    await screen.findByRole('button', { name: /Nhận 5 Coin Thưởng/ });
    expect(screen.getAllByText('✅')).toHaveLength(2);
  });
});
