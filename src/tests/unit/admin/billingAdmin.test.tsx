import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppShell } from '@/components/shell/AppShell';
import { PlatformSettingsPanel } from '@/features/admin/components/PlatformSettingsPanel';
import { BillingReportsPanel } from '@/features/billing-admin/components/BillingReportsPanel';
import { CoinLedgerPanel } from '@/features/billing-admin/components/CoinLedgerPanel';
import { PlansPanel } from '@/features/billing-admin/components/PlansPanel';
import { RewardLadderPanel } from '@/features/billing-admin/components/RewardLadderPanel';
import { SubscriptionsPanel } from '@/features/billing-admin/components/SubscriptionsPanel';
import { useAppStore } from '@/store/useAppStore';
import { mockApi } from '@/tests/support/mockApi';
import { signInAs } from '@/tests/support/signIn';

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
    render(<AppShell area="admin"><div /></AppShell>);
    const nav = screen.getByRole('navigation', { name: 'Menu Quản trị' });
    for (const label of ['Gói thành viên & Doanh thu', 'Giao dịch Coin', 'Điểm danh & vòng quay']) {
      expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument();
    }
  });
});

describe('PlansPanel', () => {
  it('opens a new price for a plan', async () => {
    signInAs('admin');
    const fetchMock = mockApi({ 'GET /admin/membership-plans': [monthly], 'POST /admin/membership-plans/plan-m/prices': {} });
    render(<PlansPanel />);

    const priceButton = await screen.findByRole('button', { name: 'Đặt giá Gói Tháng' });
    expect(priceButton.querySelector('svg')).not.toBeNull();
    await userEvent.click(priceButton);
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
  const line = {
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
    paymentId: null,
    account: { id: 'u1', fullName: 'Trần Thu Hà', email: 'ha@test.vn' },
  };

  it('names the account of every row, searches by it and only reads the wallet', async () => {
    signInAs('admin');
    const fetchMock = mockApi({
      'GET /admin/coin-transactions': page([line]),
      'GET /admin/wallets/u1': { id: 'w1', userId: 'u1', mainBalance: 100, bonusBalance: 0, updatedAt: '2026-10-10T00:00:00.000Z', lots: [] },
    });
    render(<CoinLedgerPanel />);

    expect(await screen.findByText('Trần Thu Hà')).toBeInTheDocument();
    expect(screen.getByText('ha@test.vn')).toBeInTheDocument();
    await userEvent.type(screen.getByRole('searchbox', { name: 'Tìm theo tên hoặc email tài khoản' }), 'ha@test');
    await waitFor(() => expect(fetchMock.mock.calls.some(([url]) => String(url).includes('account=ha%40test'))).toBe(true));

    await userEvent.click(screen.getByRole('button', { name: 'Xem ví của Trần Thu Hà' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Trần Thu Hà · ha@test.vn')).toBeInTheDocument();
    expect(await within(dialog).findByText('Coin chính')).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: /Điều chỉnh/ })).not.toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false);
  });

  it('gives Staff no refund and no way to change a wallet', async () => {
    signInAs('staff', []);
    mockApi({ 'GET /admin/coin-transactions': page([]) });
    render(<CoinLedgerPanel />);
    expect(await screen.findByText('Chưa có giao dịch nào.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Điều chỉnh|Hoàn Coin/ })).not.toBeInTheDocument();
  });
});

describe('Rewards', () => {
  it('refuses a second active rung for a streak day', async () => {
    signInAs('admin');
    mockApi({
      'GET /admin/reward-rules': [{ id: 'r1', code: 'day_1', name: 'Ngày 1', streakDay: 1, bonusCoins: 5, grantsSpin: false, isActive: true }],
    });
    render(<RewardLadderPanel />);

    await userEvent.click(await screen.findByRole('button', { name: /Thêm ngày/ }));
    await userEvent.selectOptions(screen.getByLabelText('Ngày thứ mấy trong chuỗi'), '1');
    expect(screen.getByText(/Ngày 1 đã có thưởng đang dùng/)).toBeInTheDocument();
  });
});

describe('PlatformSettingsPanel (MF-2 fields)', () => {
  it('saves the renewal grace hours, zero ending a failed renewal at once', async () => {
    signInAs('admin');
    const settings = {
      freeStarterEpisodeCount: 2,
      coinRateVnd: 1000,
      episodeCoinPriceMin: 1,
      episodeCoinPriceMax: 50,
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

    const grace = await screen.findByLabelText(/Thời gian thử gia hạn lại/);
    await userEvent.clear(grace);
    await userEvent.type(grace, '0');
    await userEvent.click(screen.getByRole('button', { name: /Lưu/ }));
    expect(await screen.findByText('48 → 0 giờ')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Lưu cài đặt' }));

    await waitFor(() => expect(bodyOf(fetchMock, 'PATCH', '/platform-settings')).toEqual({ planRenewalGraceHours: 0 }));
  });

  it('explains a setting out of the API range and never sends an emptied box as 0', async () => {
    signInAs('admin');
    mockApi({
      'GET /platform-settings': {
        freeStarterEpisodeCount: 2, coinRateVnd: 1000, episodeCoinPriceMin: 1, episodeCoinPriceMax: 50,
        playbackHeartbeatTimeoutSeconds: 90, subscriptionCancelWindowHours: 24, planRenewalGraceHours: 48,
        newMemberBonusCoins: 0, coinTopUpMinVnd: 10000, coinTopUpMaxVnd: 2000000, refundOnRemoval: true, updatedAt: '2026-10-01T00:00:00.000Z',
      },
    });
    render(<PlatformSettingsPanel />);

    const free = await screen.findByLabelText('Số tập xem miễn phí');
    await userEvent.clear(free);
    expect(screen.getByRole('button', { name: /Lưu/ })).toBeDisabled();
    await userEvent.type(free, '21');
    expect(screen.getByText('Nhập số nguyên từ 0 đến 20.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lưu/ })).toBeDisabled();
  });

  it('keeps Bên A of the production contract, saving only the fields changed', async () => {
    signInAs('admin');
    const settings = { coinRateVnd: 1000, refundOnRemoval: true, contractCompanyName: 'Công ty TNHH AI Cinema', contractTaxCode: null };
    const fetchMock = mockApi({ 'GET /platform-settings': settings, 'PATCH /platform-settings': settings });
    render(<PlatformSettingsPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Hợp đồng (Bên A)' }));
    expect(screen.getByLabelText('Tên công ty')).toHaveValue('Công ty TNHH AI Cinema');
    const save = screen.getByRole('button', { name: 'Lưu Bên A' });
    expect(save).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Mã số thuế'), ' 0312345678 ');
    await userEvent.type(screen.getByLabelText('Email'), 'legal@aicinema.vn');
    await userEvent.click(screen.getByRole('button', { name: 'Huỷ thay đổi' }));
    expect(screen.getByLabelText('Mã số thuế')).toHaveValue('');
    await userEvent.type(screen.getByLabelText('Mã số thuế'), ' 0312345678 ');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu Bên A (1)' }));

    await waitFor(() => expect(bodyOf(fetchMock, 'PATCH', '/platform-settings')).toEqual({ contractTaxCode: '0312345678' }));
  });
});

describe('BillingReportsPanel', () => {
  it('asks for whole Vietnam business days, never a UTC end-of-day instant', async () => {
    signInAs('admin');
    const fetchMock = mockApi({});
    render(<BillingReportsPanel />);
    await waitFor(() => expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/admin/reports/revenue'))).toBe(true));
    const url = new URL(String(fetchMock.mock.calls.find(([u]) => String(u).includes('/admin/reports/revenue'))?.[0]), 'http://x');
    expect(url.searchParams.get('to')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(url.searchParams.get('from')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
it('explains plan churn in plain words', async () => {
    signInAs('admin');
    mockApi({
      'GET /admin/reports/churn': {
        from: '2026-10-01', to: '2026-10-31', started: 10, renewed: 4, ended: 2, cancelledByMember: 1, cancelledByAdmin: 0,
        expiredForPayment: 1, expiredUnused: 0, failedRenewals: 3, running: 12, churnRate: 0.2,
      },
    });
    render(<BillingReportsPanel />);
    expect(await screen.findByText('Gói Tháng mới đăng ký')).toBeInTheDocument();
    expect(screen.getByText('Gói Tháng đã huỷ hoặc hết hạn')).toBeInTheDocument();
    expect(screen.getByText('= gói huỷ hoặc hết hạn ÷ gói mới đăng ký')).toBeInTheDocument();
    expect(screen.getByText('20.0%')).toBeInTheDocument();
    expect(screen.queryByText('Gói vào và ra')).not.toBeInTheDocument();
  });
});
