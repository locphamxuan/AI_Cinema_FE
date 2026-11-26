import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CoinLedgerPanel } from '@/features/billing-admin/components/CoinLedgerPanel';
import { refundSummary } from '@/features/billing-admin/components/RefundPaymentButton';
import { SubscriptionsPanel } from '@/features/billing-admin/components/SubscriptionsPanel';
import { toast } from '@/components/ui/Toast';
import { mockApi } from '@/tests/support/mockApi';
import { signInAs } from '@/tests/support/signIn';

vi.mock('@/components/ui/Toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const page = (data: unknown[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 20 } });
const line = (id: string, entryType: string, fields: Record<string, unknown> = {}) => ({
  id,
  entryType,
  mainAmount: -30,
  bonusAmount: 0,
  rateVnd: null,
  description: null,
  referenceType: null,
  referenceId: null,
  createdAt: '2026-11-20T03:00:00.000Z',
  mainBalanceAfter: 70,
  bonusBalanceAfter: 0,
  walletId: 'w1',
  userId: 'u1',
  account: { id: 'u1', fullName: 'Trần Thu Hà', email: 'ha@test.vn' },
  paymentId: id,
  ...fields,
});
const refund = { paymentId: 'p1', mainCoins: 30, bonusCoins: 5, episodeAccessId: 'a1', subscriptionCycleId: null, subscriptionEnded: false };

afterEach(() => vi.unstubAllGlobals());

describe('Admin refund of a Coin payment', () => {
  it('refunds the whole payment from its first row only, after a confirm, and says the episode is taken back', async () => {
    signInAs('admin');
    const fetchMock = mockApi({
      'GET /admin/coin-transactions': page([
        line('p1', 'EPISODE_PURCHASE'),
        line('b1', 'EPISODE_PURCHASE', { mainAmount: 0, bonusAmount: -5, paymentId: 'p1' }),
        line('t1', 'TOP_UP', { mainAmount: 100, paymentId: null }),
      ]),
      'POST /admin/coin-transactions/p1/refund': refund,
    });
    render(<CoinLedgerPanel />);

    const buttons = await screen.findAllByRole('button', { name: 'Hoàn Coin' });
    expect(buttons).toHaveLength(1);
    await userEvent.click(buttons[0]);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/mất quyền xem tập đã mua/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Hoàn toàn bộ' }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Đã hoàn toàn bộ khoản thanh toán', expect.stringContaining('không còn quyền xem tập')),
    );
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(1);
  });

  it('says a refunded plan cycle and the plan that ended', () => {
    const plan = { ...refund, episodeAccessId: null, subscriptionCycleId: 'c1', subscriptionEnded: true };
    expect(refundSummary(plan)).toBe('30 Coin chính và 5 Coin thưởng đã về lại ví. Kỳ gói được ghi Đã hoàn Coin và gói đang chạy đã kết thúc.');
    expect(refundSummary({ ...plan, subscriptionEnded: false })).toMatch(/Kỳ gói được ghi Đã hoàn Coin\.$/);
  });

  it('shows a refunded plan cycle in plain Vietnamese', async () => {
    signInAs('admin');
    const sub = {
      id: 's1',
      status: 'CANCELLED',
      source: 'PURCHASE',
      priceCoins: 99,
      startedAt: '2026-11-01T00:00:00.000Z',
      autoRenew: false,
      currentPeriodStart: '2026-11-01T00:00:00.000Z',
      currentPeriodEnd: '2026-12-01T00:00:00.000Z',
      nextRenewalAt: null,
      endedAt: '2026-11-20T00:00:00.000Z',
      endReason: 'CANCELLED_BY_ADMIN',
      renewalsCompleted: 0,
      createdAt: '2026-11-01T00:00:00.000Z',
      plan: { id: 'plan-m', code: 'MONTHLY', name: 'Gói Tháng' },
      user: { id: 'u1', fullName: 'Member Một', email: 'm1@test.vn' },
    };
    const cycle = {
      id: 'c1',
      cycleNumber: 1,
      periodStart: '2026-11-01T00:00:00.000Z',
      periodEnd: '2026-12-01T00:00:00.000Z',
      priceCoins: 99,
      status: 'REFUNDED',
      mainCoinsCharged: 99,
      bonusCoinsCharged: 0,
      failureReason: null,
      attemptedAt: '2026-11-01T00:00:00.000Z',
    };
    mockApi({
      'GET /admin/subscriptions': page([sub]),
      'GET /admin/subscriptions/s1': { ...sub, cycles: [cycle] },
      'GET /admin/membership-plans': [],
    });
    render(<SubscriptionsPanel />);
    await userEvent.click(await screen.findByText('Member Một'));
    expect(await screen.findByText('Đã hoàn Coin cho Member')).toBeInTheDocument();
  });
});
