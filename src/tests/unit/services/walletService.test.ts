import { describe, it, expect } from 'vitest';
import { walletService } from '@/services/walletService';
import { getTodayDayIndex, VN_DAY_LABELS } from '@/lib/dateUtils';

describe('Wallet Service (src/services/walletService.ts)', () => {
  it('calculates day index properly for Vietnam weekdays', () => {
    // Wednesday 2026-09-23 -> index 2 (T4)
    const wed = new Date('2026-09-23T10:00:00');
    expect(wed.getDay()).toBe(3);
    expect(getTodayDayIndex(wed)).toBe(2);
    expect(VN_DAY_LABELS[getTodayDayIndex(wed)]).toBe('T4');

    // Sunday 2026-09-27 -> index 6 (CN)
    const sun = new Date('2026-09-27T10:00:00');
    expect(getTodayDayIndex(sun)).toBe(6);
    expect(VN_DAY_LABELS[getTodayDayIndex(sun)]).toBe('CN');
  });

  it('fetches wallet balance successfully', async () => {
    const res = await walletService.getBalance();
    expect(res.success).toBe(true);
    expect(res.data.mainCoin).toBeDefined();
    expect(res.data.bonusCoin).toBeDefined();
  });

  it('fetches check-in streak calendar with dynamic today', async () => {
    const res = await walletService.getCheckInStreak();
    expect(res.success).toBe(true);
    expect(res.data.days).toHaveLength(7);
    const today = res.data.days.find((d) => d.isToday);
    expect(today).toBeDefined();
    expect(today?.dayLabel).toBe('T4'); // Today is Wednesday (T4)
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
