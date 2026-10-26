import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { PlatformSettingsPanel } from '@/features/admin/components/PlatformSettingsPanel';
import { CoinLedgerPanel } from '@/features/billing-admin/components/CoinLedgerPanel';
import { PlansPanel } from '@/features/billing-admin/components/PlansPanel';
import { RewardLadderPanel } from '@/features/billing-admin/components/RewardLadderPanel';
import { chanceOf } from '@/features/billing-admin/components/RewardWheelPanel';
import { SubscriptionsPanel } from '@/features/billing-admin/components/SubscriptionsPanel';
import { useAppStore } from '@/store/useAppStore';
import { mockApi } from '@/tests/support/mockApi';
import { signInAs } from '@/tests/support/signIn';
import type { RewardPrize } from '@/types/episodeAccess';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/admin/membership-plans',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

const page = (data: unknown[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 20 } });
const bodyOf = (fetchMock: ReturnType<typeof mockApi>, method: string, path: string) => {
  const call = fetchMock.mock.calls.find(([url, init]) => init?.method === method && String(url).endsWith(path));
  return call ? JSON.parse(String(call[1]?.body)) : undefined;
};

const monthly = {
  id: 'plan-m',
  code: 'MONTHLY',
  name: 'Gói Tháng',
  description: null,
  period: 'MONTHLY',
  durationDays: 30,
  isFree: false,
  isActive: true,
  sortOrder: 1,
  isFeatured: true,
  features: null,
  priceCoins: 900,
};

const subscription = {
  id: 'sub-1',
  status: 'ACTIVE',
  source: 'PURCHASE',
  autoRenew: true,
  priceCoins: 900,
  startedAt: '2026-10-01T00:00:00.000Z',
  currentPeriodEnd: '2026-10-31T00:00:00.000Z',
  nextRenewalAt: '2026-10-31T00:00:00.000Z',
  endedAt: null,
  endReason: null,
  renewalsCompleted: 0,
  createdAt: '2026-10-01T00:00:00.000Z',
  plan: { id: 'plan-m', code: 'MONTHLY', name: 'Gói Tháng' },
  user: { id: 'u1', fullName: 'Trần Thu Hà', email: 'ha@test.vn' },
};

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState({ isAuthenticated: false, user: null });
});
afterEach(() => vi.unstubAllGlobals());

describe('Admin MF-2 sections', () => {
  it('opens the billing and reward sections to the Admin', () => {
    signInAs('admin');
    render(<AdminSidebar />);
    const nav = screen.getByRole('navigation', { name: 'Khu quản trị' });
    for (const label of ['Gói thành viên', 'Giao dịch Coin', 'Điểm danh & vòng quay', 'Báo cáo doanh thu gói']) {
      expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument();
    }
  });
});

describe('PlansPanel', () => {
  it('opens a new price for a plan', async () => {
    signInAs('admin');
    const fetchMock = mockApi({ 'GET /admin/membership-plans': [monthly], 'POST /admin/membership-plans/plan-m/prices': {} });
    render(<PlansPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Đặt giá Gói Tháng' }));
    const input = screen.getByLabelText('Giá mới (Coin / kỳ)');
    await userEvent.clear(input);
    await userEvent.type(input, '1200');
    await userEvent.click(screen.getByRole('button', { name: 'Đặt giá' }));

    await waitFor(() => expect(bodyOf(fetchMock, 'POST', '/admin/membership-plans/plan-m/prices')).toEqual({ priceCoins: 1200 }));
  });
});

describe('SubscriptionsPanel', () => {
  it('lets the Admin end a running plan with a reason', async () => {
    signInAs('admin');
    const fetchMock = mockApi({
      'GET /admin/subscriptions': page([subscription]),
      'GET /admin/subscriptions/sub-1': { ...subscription, cycles: [] },
      'POST /admin/subscriptions/sub-1/cancel': {},
    });
    render(<SubscriptionsPanel />);

    await userEvent.click(await screen.findByRole('button', { name: /Trần Thu Hà/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Kết thúc gói ngay' }));
    await userEvent.type(screen.getByLabelText('Lý do (ghi vào nhật ký)'), 'Gian lận thanh toán');
    await userEvent.click(screen.getByRole('button', { name: 'Xác nhận kết thúc' }));

    await waitFor(() => expect(bodyOf(fetchMock, 'POST', '/admin/subscriptions/sub-1/cancel')).toEqual({ reason: 'Gian lận thanh toán' }));
  });

  it('only shows the plan to Staff, who cannot end it', async () => {
    signInAs('staff');
    mockApi({ 'GET /admin/subscriptions': page([subscription]), 'GET /admin/subscriptions/sub-1': { ...subscription, cycles: [] } });
    render(<SubscriptionsPanel />);

    await userEvent.click(await screen.findByRole('button', { name: /Trần Thu Hà/ }));
    expect(await screen.findByText('Chưa thu Coin kỳ nào.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Kết thúc gói ngay' })).not.toBeInTheDocument();
  });
});

describe('CoinLedgerPanel', () => {
  it('records a manual correction with its reason', async () => {
    signInAs('admin');
    const fetchMock = mockApi({
      'GET /admin/coin-transactions': page([
        {
          id: 't1',
          entryType: 'TOP_UP',
          mainAmount: 100,
          bonusAmount: 0,
          rateVnd: 1000,
          description: 'Nạp qua VNPay',
          referenceType: null,
          referenceId: null,
          createdAt: '2026-10-10T00:00:00.000Z',
          mainBalanceAfter: 100,
          bonusBalanceAfter: 0,
          walletId: 'w1',
          userId: 'u1',
        },
      ]),
      'GET /admin/wallets/u1': { id: 'w1', userId: 'u1', mainBalance: 100, bonusBalance: 0, updatedAt: '2026-10-10T00:00:00.000Z', lots: [] },
      'POST /admin/wallet-adjustments': { userId: 'u1', mainBalance: 120, bonusBalance: 0 },
    });
    render(<CoinLedgerPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Xem ví của tài khoản này' }));
    await userEvent.click(await screen.findByRole('button', { name: /Điều chỉnh số dư/ }));
    await userEvent.type(screen.getByLabelText('Coin chính'), '20');
    await userEvent.type(screen.getByLabelText('Lý do (bắt buộc)'), 'Bù lần nạp lỗi');
    await userEvent.click(screen.getByRole('button', { name: 'Ghi điều chỉnh' }));

    await waitFor(() =>
      expect(bodyOf(fetchMock, 'POST', '/admin/wallet-adjustments')).toEqual({ userId: 'u1', mainAmount: 20, reason: 'Bù lần nạp lỗi' }),
    );
  });

  it('gives Staff no way to change a wallet', async () => {
    signInAs('staff', []);
    mockApi({ 'GET /admin/coin-transactions': page([]) });
    render(<CoinLedgerPanel />);
    expect(await screen.findByText('Chưa có giao dịch nào.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Điều chỉnh/ })).not.toBeInTheDocument();
  });
});

describe('Rewards', () => {
  it('works out each prize chance from the active weights', () => {
    const prize = (id: string, weight: number, isActive = true) => ({ id, weight, isActive }) as RewardPrize;
    const prizes = [prize('a', 60), prize('b', 40), prize('c', 900, false)];
    expect(chanceOf(prizes[0], prizes)).toBeCloseTo(60);
    expect(chanceOf(prizes[2], prizes)).toBe(0);
  });

  it('refuses a second active rung for a streak day', async () => {
    signInAs('admin');
    mockApi({
      'GET /admin/reward-rules': [{ id: 'r1', code: 'day_1', name: 'Ngày 1', streakDay: 1, bonusCoins: 5, grantsSpin: false, isActive: true }],
    });
    render(<RewardLadderPanel />);

    await userEvent.click(await screen.findByRole('button', { name: /Thêm ngày/ }));
    await userEvent.selectOptions(screen.getByLabelText('Ngày trong chuỗi'), '1');
    expect(screen.getByText(/Ngày 1 đã có cấu hình đang dùng/)).toBeInTheDocument();
  });
});

describe('PlatformSettingsPanel (MF-2 fields)', () => {
  it('saves the renewal grace hours, zero ending a failed renewal at once', async () => {
    signInAs('admin');
    const settings = {
      freeStarterEpisodeCount: 2,
      tokenRateVnd: 1000,
      coinRateVnd: 1000,
      episodeCoinPriceMin: 1,
      episodeCoinPriceMax: 50,
      bonusCoinExpiryDays: 30,
      playbackHeartbeatTimeoutSeconds: 90,
      subscriptionCancelWindowHours: 24,
      planRenewalGraceHours: 48,
      newMemberBonusCoins: 0,
      coinTopUpMinVnd: 10000,
      coinTopUpMaxVnd: 2000000,
      refundOnRemoval: true,
      updatedAt: '2026-10-01T00:00:00.000Z',
    };
    const fetchMock = mockApi({ 'GET /platform-settings': settings, 'PATCH /platform-settings': settings });
    render(<PlatformSettingsPanel />);

    const grace = await screen.findByLabelText(/Thời gian chờ gia hạn lỗi/);
    await userEvent.clear(grace);
    await userEvent.type(grace, '0');
    await userEvent.click(screen.getByRole('button', { name: /Lưu/ }));

    await waitFor(() => expect(bodyOf(fetchMock, 'PATCH', '/platform-settings')).toEqual({ planRenewalGraceHours: 0 }));
  });
});
