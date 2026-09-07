import { describe, it, expect } from 'vitest';
import { walletService } from '@/services/walletService';

describe('Wallet Service (src/services/walletService.ts)', () => {
  it('fetches wallet balance successfully', async () => {
    const res = await walletService.getBalance();
    expect(res.success).toBe(true);
    expect(res.data.mainCoin).toBeDefined();
    expect(res.data.bonusCoin).toBeDefined();
  });

  it('fetches check-in streak calendar', async () => {
    const res = await walletService.getCheckInStreak();
    expect(res.success).toBe(true);
    expect(res.data.days).toHaveLength(7);
  });

  it('calculates coin deduction prioritizing main coin', async () => {
    const wallet = { mainCoin: 50, bonusCoin: 30 };
    const res = await walletService.unlockEpisode('m-1', 'ep-1', 20, wallet);

    expect(res.success).toBe(true);
    expect(res.data.deductedFrom).toBe('main');
    expect(res.data.mainDeducted).toBe(20);
    expect(res.data.bonusDeducted).toBe(0);
    expect(res.data.newBalance.mainCoin).toBe(30);
  });

  it('splits deduction when main coin is less than price', async () => {
    const wallet = { mainCoin: 10, bonusCoin: 30 };
    const res = await walletService.unlockEpisode('m-1', 'ep-1', 20, wallet);

    expect(res.success).toBe(true);
    expect(res.data.deductedFrom).toBe('split');
    expect(res.data.mainDeducted).toBe(10);
    expect(res.data.bonusDeducted).toBe(10);
    expect(res.data.newBalance.mainCoin).toBe(0);
    expect(res.data.newBalance.bonusCoin).toBe(20);
  });

  it('handles insufficient funds error', async () => {
    const wallet = { mainCoin: 5, bonusCoin: 5 };
    const res = await walletService.unlockEpisode('m-1', 'ep-1', 20, wallet);

    expect(res.success).toBe(false);
  });
});
