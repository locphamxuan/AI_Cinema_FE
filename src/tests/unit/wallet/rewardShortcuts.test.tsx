import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import RewardShortcuts from '@/components/wallet/RewardShortcuts';
import { SpinWheel } from '@/components/wallet/spin/SpinWheel';
import { useAppStore } from '@/store/useAppStore';

const prize = { id: 'p1', code: 'c', name: '50 Coin', type: 'BONUS_COIN' as const, bonusCoins: 50, planDays: null };

describe('RewardShortcuts', () => {
  beforeEach(() => {
    useAppStore.setState({ availableSpins: 0, isRewardSpinModalOpen: false, isCheckInModalOpen: false });
  });

  it('keeps the wheel reachable with no spin left and opens it', () => {
    render(<RewardShortcuts />);
    expect(screen.getByLabelText('Còn 0 lượt quay')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Vòng quay/ }));
    expect(useAppStore.getState().isRewardSpinModalOpen).toBe(true);
  });

  it('shows the spins left and offers the check-in where asked', () => {
    useAppStore.setState({ availableSpins: 3 });
    render(<RewardShortcuts withCheckIn />);
    expect(screen.getByLabelText('Còn 3 lượt quay')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Điểm danh/ }));
    expect(useAppStore.getState().isCheckInModalOpen).toBe(true);
  });
});

describe('SpinWheel hub', () => {
  it('tells the member how many spins are left in the middle of the wheel', () => {
    render(<SpinWheel prizes={[prize]} rotation={0} spinning={false} spinsLeft={2} />);
    expect(screen.getByLabelText('Bạn còn 2 lượt quay')).toHaveTextContent('Bạn còn2lượt');
  });
});
