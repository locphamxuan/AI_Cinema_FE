import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import RewardSpinModal from '@/components/wallet/RewardSpinModal';
import { landingRotation, SPIN_MS } from '@/components/wallet/spin/SpinWheel';
import { useAppStore } from '@/store/useAppStore';
import { callsOf, mockApi } from '@/tests/support/mockApi';

const coins = { id: 'p1', code: 'bonus_50', name: '50 Coin thưởng', type: 'BONUS_COIN', bonusCoins: 50, planDays: null };
const days = { id: 'p2', code: 'plan_3', name: '3 ngày gói Tháng', type: 'PLAN_DAYS', bonusCoins: null, planDays: 3 };

describe('landingRotation', () => {
  it('leaves the centre of the won slice under the top pointer', () => {
    for (const [index, count] of [
      [0, 4],
      [3, 4],
      [2, 5],
    ]) {
      const slice = 360 / count;
      const end = landingRotation(123, index, count);
      expect((end + index * slice + slice / 2) % 360).toBeCloseTo(0);
      expect(end - 123).toBeGreaterThan(360 * 6);
    }
  });
});

describe('RewardSpinModal (BR-09)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    useAppStore.setState({ isAuthenticated: true, isRewardSpinModalOpen: true, wallet: { mainCoin: 0, bonusCoin: 0 } });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    useAppStore.setState({ isRewardSpinModalOpen: false });
  });

  it('spins with an idempotency key and shows what the BE paid once the wheel stops', async () => {
    const fetchMock = mockApi({
      'GET /rewards/spins': { availableSpins: 1, prizes: [coins, days], history: [] },
      'POST /rewards/spins': {
        id: 's1',
        status: 'USED',
        grantedAt: '2026-10-11T00:00:00.000Z',
        spunAt: '2026-10-11T01:00:00.000Z',
        prize: coins,
        bonusCoins: 50,
        planDays: null,
        planActiveUntil: null,
        mainBalance: 0,
        bonusBalance: 50,
        availableSpins: 0,
      },
    });

    render(<RewardSpinModal />);
    fireEvent.click(await screen.findByRole('button', { name: 'Quay ngay (1)' }));
    expect(await screen.findByRole('button', { name: 'Đang quay...' })).toBeDisabled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SPIN_MS);
    });

    expect(screen.getByRole('status')).toHaveTextContent('+50 Coin thưởng đã được cộng vào ví');
    expect(useAppStore.getState().wallet).toEqual({ mainCoin: 0, bonusCoin: 50 });
    expect(screen.getByRole('button', { name: 'Hết lượt quay' })).toBeDisabled();
    const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect((post?.[1]?.headers as Record<string, string>)['Idempotency-Key']).toBeTruthy();
    expect(callsOf(fetchMock).filter((c) => c.startsWith('POST'))).toHaveLength(1);
  });

  it('says so when the Admin has put no prize on the wheel', async () => {
    mockApi({ 'GET /rewards/spins': { availableSpins: 2, prizes: [], history: [] } });

    render(<RewardSpinModal />);

    expect(await screen.findByText('Chưa có giải thưởng phù hợp cho tài khoản này.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quay ngay (2)' })).toBeDisabled();
  });
});
