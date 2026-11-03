import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WalletHeaderBadge from '@/components/wallet/WalletHeaderBadge';
import { useAppStore } from '@/store/useAppStore';

describe('Integration Flow: WalletHeaderBadge (src/components/wallet/WalletHeaderBadge.tsx)', () => {
  it('renders both Main Coin and Bonus Coin in the capsule badge', () => {
    useAppStore.setState({
      wallet: { mainCoin: 120, bonusCoin: 100 },
      checkInStreak: {
        ...useAppStore.getState().checkInStreak,
        todayClaimed: false,
      },
    });

    render(<WalletHeaderBadge />);

    // Should display main coin amount (120)
    expect(screen.getByText('120')).toBeDefined();

    // Should display bonus coin amount (+100)
    expect(screen.getByText('+100')).toBeDefined();
  });
});
