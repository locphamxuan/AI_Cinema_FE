import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RewardWheelPanel } from '@/features/billing-admin/components/RewardWheelPanel';
import { mockApi } from '@/tests/support/mockApi';
import { signInAs } from '@/tests/support/signIn';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/admin/rewards',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));
afterEach(() => vi.unstubAllGlobals());

const coin = { id: 'c1', code: 'bonus_20', name: '20 Coin', type: 'BONUS_COIN', bonusCoins: 20, planDays: null, weight: 98, isActive: true };
const plan = { id: 'p1', code: 'plan_30', name: '30 ngày', type: 'PLAN_DAYS', bonusCoins: null, planDays: 30, weight: 2, isActive: false };
const bodyOf = (fetchMock: ReturnType<typeof mockApi>, method: string, path: string) => {
  const call = fetchMock.mock.calls.find(([url, init]) => init?.method === method && String(url).endsWith(path));
  return call ? JSON.parse(String(call[1]?.body)) : undefined;
};

describe('RewardWheelPanel: Admin configures the wheel members preview', () => {
  it('adds a plan-days prize with its weight', async () => {
    signInAs('admin');
    const fetchMock = mockApi({ 'GET /admin/reward-prizes': [coin], 'POST /admin/reward-prizes': { ...plan, isActive: true } });
    render(<RewardWheelPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Thêm giải' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText(/Mã giải/), 'plan_30');
    await userEvent.selectOptions(within(dialog).getByLabelText('Loại giải'), 'PLAN_DAYS');
    await userEvent.type(within(dialog).getByLabelText('Tên hiển thị'), '30 ngày gói Tháng');
    await userEvent.type(within(dialog).getByLabelText(/Số ngày gói Tháng/), '30');
    await userEvent.type(within(dialog).getByLabelText(/Trọng số/), '2');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Thêm giải' }));

    await waitFor(() =>
      expect(bodyOf(fetchMock, 'POST', '/admin/reward-prizes')).toEqual({ code: 'plan_30', name: '30 ngày gói Tháng', type: 'PLAN_DAYS', weight: 2, planDays: 30 }),
    );
  });

  it('refuses a code already on the wheel and plan days above 30', async () => {
    signInAs('admin');
    mockApi({ 'GET /admin/reward-prizes': [coin] });
    render(<RewardWheelPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Thêm giải' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText(/Mã giải/), 'BONUS_20');
    expect(within(dialog).getByText('Mã này đã có trên vòng quay.')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Thêm giải' })).toBeDisabled();
  });

  it('edits the weight and puts a switched-off prize back on the wheel', async () => {
    signInAs('admin');
    const fetchMock = mockApi({ 'GET /admin/reward-prizes': [coin, plan], 'PATCH /admin/reward-prizes/p1': { ...plan, isActive: true } });
    render(<RewardWheelPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Sửa 30 ngày' }));
    const dialog = screen.getByRole('dialog');
    const weight = within(dialog).getByLabelText(/Trọng số/);
    await userEvent.clear(weight);
    await userEvent.type(weight, '5');
    await userEvent.click(within(dialog).getByLabelText('Bật lại trên vòng quay'));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() =>
      expect(bodyOf(fetchMock, 'PATCH', '/admin/reward-prizes/p1')).toEqual({ name: '30 ngày', weight: 5, isActive: true, planDays: 30 }),
    );
  });

  it('switches an active prize off and cannot switch off one already off', async () => {
    signInAs('admin');
    vi.stubGlobal('confirm', () => true);
    const fetchMock = mockApi({ 'GET /admin/reward-prizes': [coin, plan], 'DELETE /admin/reward-prizes/c1': null });
    render(<RewardWheelPanel />);

    expect(await screen.findByRole('button', { name: 'Tắt 30 ngày' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Tắt 20 Coin' }));
    await waitFor(() => expect(fetchMock.mock.calls.some(([u, i]) => i?.method === 'DELETE' && String(u).endsWith('/admin/reward-prizes/c1'))).toBe(true));
  });
});
