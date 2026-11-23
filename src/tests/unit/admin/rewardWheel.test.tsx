import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RewardWheelPanel } from '@/features/billing-admin/components/RewardWheelPanel';
import { suggestPrizeCode } from '@/features/billing-admin/components/RewardPrizeModal';
import { chanceWith, formatPercent } from '@/features/billing-admin/components/rewardOdds';
import type { RewardPrize } from '@/types/billing';
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
const called = (fetchMock: ReturnType<typeof mockApi>, method: string, path: string) =>
  fetchMock.mock.calls.some(([u, i]) => i?.method === method && String(u).endsWith(path));

describe('reward odds helpers', () => {
  it('works out the live chance among the other active prizes and formats it in Vietnamese', () => {
    const list = [coin, plan] as RewardPrize[];
    expect(chanceWith(2, list, 'p1')).toBeCloseTo(2);
    expect(chanceWith(0, list)).toBe(0);
    expect(formatPercent(12.345)).toBe('12,3%');
    expect(formatPercent(50)).toBe('50%');
  });

  it('makes a prize key no other prize holds', () => {
    expect(suggestPrizeCode('BONUS_COIN', 20, [coin] as RewardPrize[])).toBe('bonus_20_2');
    expect(suggestPrizeCode('PLAN_DAYS', 7, [coin] as RewardPrize[])).toBe('plan_7');
  });
});

describe('RewardWheelPanel: Admin configures the wheel members preview', () => {
  it('adds a plan-days prize and shows its percentage while typing', async () => {
    signInAs('admin');
    const fetchMock = mockApi({ 'GET /admin/reward-prizes': [coin], 'POST /admin/reward-prizes': { ...plan, isActive: true } });
    render(<RewardWheelPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Thêm giải' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.selectOptions(within(dialog).getByLabelText('Loại giải'), 'PLAN_DAYS');
    await userEvent.type(within(dialog).getByLabelText(/Số ngày gói Tháng/), '30');
    await userEvent.type(within(dialog).getByLabelText('Tỉ lệ trúng'), '2');
    expect(within(dialog).getByText('2%')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Thêm giải' }));

    await waitFor(() =>
      expect(bodyOf(fetchMock, 'POST', '/admin/reward-prizes')).toEqual({
        code: 'plan_30',
        name: '30 ngày gói Tháng',
        type: 'PLAN_DAYS',
        weight: 2,
        planDays: 30,
      }),
    );
  });

  it('refuses plan days above 30', async () => {
    signInAs('admin');
    mockApi({ 'GET /admin/reward-prizes': [coin] });
    render(<RewardWheelPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Thêm giải' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.selectOptions(within(dialog).getByLabelText('Loại giải'), 'PLAN_DAYS');
    await userEvent.type(within(dialog).getByLabelText(/Số ngày gói Tháng/), '31');
    await userEvent.type(within(dialog).getByLabelText('Tỉ lệ trúng'), '2');
    expect(within(dialog).getByRole('button', { name: 'Thêm giải' })).toBeDisabled();
  });

  it('edits the chance and turns a switched-off prize back on from the modal', async () => {
    signInAs('admin');
    const fetchMock = mockApi({ 'GET /admin/reward-prizes': [coin, plan], 'PATCH /admin/reward-prizes/p1': { ...plan, isActive: true } });
    render(<RewardWheelPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Sửa 30 ngày' }));
    const dialog = screen.getByRole('dialog');
    const weight = within(dialog).getByLabelText('Tỉ lệ trúng');
    await userEvent.clear(weight);
    await userEvent.type(weight, '2');
    expect(within(dialog).getByText(/Khi bật lại/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('switch', { name: /Bật giải trên vòng quay/ }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() =>
      expect(bodyOf(fetchMock, 'PATCH', '/admin/reward-prizes/p1')).toEqual({ name: '30 ngày', weight: 2, isActive: true, planDays: 30 }),
    );
  });

  it('switches a prize on or off straight from the list', async () => {
    signInAs('admin');
    const fetchMock = mockApi({ 'GET /admin/reward-prizes': [coin, plan], 'PATCH /admin/reward-prizes/c1': { ...coin, isActive: false } });
    render(<RewardWheelPanel />);

    const toggle = await screen.findByRole('switch', { name: 'Bật giải 20 Coin trên vòng quay' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(toggle);
    await waitFor(() => expect(bodyOf(fetchMock, 'PATCH', '/admin/reward-prizes/c1')).toEqual({ isActive: false }));
  });

  it('deletes a prize for good only after a confirm that says so', async () => {
    signInAs('admin');
    const fetchMock = mockApi({ 'GET /admin/reward-prizes': [coin, plan], 'DELETE /admin/reward-prizes/p1': { id: 'p1', deleted: true } });
    render(<RewardWheelPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Xoá 30 ngày' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/không khôi/)).toBeInTheDocument();
    expect(called(fetchMock, 'DELETE', '/admin/reward-prizes/p1')).toBe(false);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Xoá vĩnh viễn' }));
    await waitFor(() => expect(called(fetchMock, 'DELETE', '/admin/reward-prizes/p1')).toBe(true));
  });
});
