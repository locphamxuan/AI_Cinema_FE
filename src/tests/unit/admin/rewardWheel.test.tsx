import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RewardWheelPanel } from '@/features/billing-admin/components/RewardWheelPanel';
import { suggestPrizeCode } from '@/features/billing-admin/components/RewardPrizeModal';
import { activeTotal, evenSplit, formatChance, parsePercent, totalProblem } from '@/features/billing-admin/components/rewardOdds';
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

const coin = { id: 'c1', code: 'bonus_20', name: '20 Coin', type: 'BONUS_COIN', bonusCoins: 20, planDays: null, weight: 7500, isActive: true };
const coin2 = { id: 'c2', code: 'bonus_50', name: '50 Coin', type: 'BONUS_COIN', bonusCoins: 50, planDays: null, weight: 2500, isActive: true };
const plan = { id: 'p1', code: 'plan_30', name: '30 ngày', type: 'PLAN_DAYS', bonusCoins: null, planDays: 30, weight: 200, isActive: false };
const bodyOf = (fetchMock: ReturnType<typeof mockApi>, method: string, path: string) => {
  const call = fetchMock.mock.calls.find(([url, init]) => init?.method === method && String(url).endsWith(path));
  return call ? JSON.parse(String(call[1]?.body)) : undefined;
};
const called = (fetchMock: ReturnType<typeof mockApi>, method: string, path: string) =>
  fetchMock.mock.calls.some(([u, i]) => i?.method === method && String(u).endsWith(path));

describe('reward chance helpers', () => {
  it('reads a percent with up to two decimals as basis points', () => {
    expect(parsePercent('12,5')).toBe(1250);
    expect(parsePercent('0.01')).toBe(1);
    expect(parsePercent('100')).toBe(10_000);
    expect(parsePercent('0')).toBeNull();
    expect(parsePercent('100.01')).toBeNull();
    expect(parsePercent('1,234')).toBeNull();
    expect(formatChance(1250)).toBe('12,5%');
  });

  it('adds up the prizes switched on and says what is missing or over', () => {
    const list = [coin, coin2, plan] as RewardPrize[];
    expect(activeTotal(list)).toBe(10_000);
    expect(activeTotal(list, { c2: null })).toBe(7500);
    expect(activeTotal(list, { p1: 200 })).toBe(10_200);
    expect(totalProblem(7500)).toBe('còn thiếu 25%');
    expect(totalProblem(10_200)).toBe('thừa 2%');
    expect(totalProblem(10_000)).toBeNull();
    expect(totalProblem(0)).toBeNull();
    expect(evenSplit(3)).toEqual([3334, 3333, 3333]);
  });

  it('makes a prize key no other prize holds', () => {
    expect(suggestPrizeCode('BONUS_COIN', 20, [coin] as RewardPrize[])).toBe('bonus_20_2');
    expect(suggestPrizeCode('PLAN_DAYS', 7, [coin] as RewardPrize[])).toBe('plan_7');
  });
});

describe('RewardWheelPanel: the Admin sets each chance in percent', () => {
  it('shows the total of the prizes switched on', async () => {
    signInAs('admin');
    mockApi({ 'GET /admin/reward-prizes': [coin, coin2, plan] });
    render(<RewardWheelPanel />);
    expect(await screen.findByText('2/3 giải đang bật · Tổng tỉ lệ 100%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('adds a prize that fills the wheel to 100%, sent as basis points', async () => {
    signInAs('admin');
    const fetchMock = mockApi({ 'GET /admin/reward-prizes': [coin], 'POST /admin/reward-prizes': { ...plan, isActive: true } });
    render(<RewardWheelPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Thêm giải' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.selectOptions(within(dialog).getByLabelText('Loại giải'), 'PLAN_DAYS');
    await userEvent.type(within(dialog).getByLabelText(/Số ngày gói Tháng/), '30');
    await userEvent.type(within(dialog).getByLabelText(/Tỉ lệ trúng/), '30');
    expect(within(dialog).getByRole('alert')).toHaveTextContent('thừa 5%');
    expect(within(dialog).getByRole('button', { name: 'Thêm giải' })).toBeDisabled();
    await userEvent.clear(within(dialog).getByLabelText(/Tỉ lệ trúng/));
    await userEvent.type(within(dialog).getByLabelText(/Tỉ lệ trúng/), '25');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Thêm giải' }));

    await waitFor(() =>
      expect(bodyOf(fetchMock, 'POST', '/admin/reward-prizes')).toEqual({
        code: 'plan_30',
        name: '30 ngày gói Tháng',
        type: 'PLAN_DAYS',
        weight: 2500,
        isActive: true,
        planDays: 30,
      }),
    );
  });

  it('switches a prize off straight away when the wheel still adds up', async () => {
    signInAs('admin');
    const fetchMock = mockApi({ 'GET /admin/reward-prizes': [{ ...coin, weight: 10_000 }, plan], 'PATCH /admin/reward-prizes/p1': plan });
    render(<RewardWheelPanel />);
    // Switching the only prize off empties the wheel, which is allowed.
    await userEvent.click(await screen.findByRole('switch', { name: 'Bật giải 20 Coin trên vòng quay' }));
    await waitFor(() => expect(called(fetchMock, 'PATCH', '/admin/reward-prizes/c1')).toBe(true));
  });

  it('opens "Chia lại tỉ lệ" for a switch that breaks 100%, and saves every chance in one go', async () => {
    signInAs('admin');
    const fetchMock = mockApi({ 'GET /admin/reward-prizes': [coin, coin2, plan], 'PUT /admin/reward-prizes/chances': [] });
    render(<RewardWheelPanel />);

    await userEvent.click(await screen.findByRole('switch', { name: 'Bật giải 30 ngày trên vòng quay' }));
    expect(called(fetchMock, 'PATCH', '/admin/reward-prizes/p1')).toBe(false);
    const dialog = screen.getByRole('dialog', { name: 'Chia lại tỉ lệ trúng' });
    expect(within(dialog).getByText(/thì tổng là 102%/)).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Lưu tỉ lệ' })).toBeDisabled();
    const first = within(dialog).getByLabelText('Tỉ lệ trúng (%) của 20 Coin');
    await userEvent.clear(first);
    await userEvent.type(first, '73');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Lưu tỉ lệ' }));

    await waitFor(() =>
      expect(bodyOf(fetchMock, 'PUT', '/admin/reward-prizes/chances')).toEqual({
        prizes: [
          { id: 'c1', weight: 7300 },
          { id: 'c2', weight: 2500 },
          { id: 'p1', weight: 200 },
        ],
      }),
    );
  });

  it('asks to switch an active prize off before deleting it, and deletes a switched-off one after a confirm', async () => {
    signInAs('admin');
    const fetchMock = mockApi({ 'GET /admin/reward-prizes': [coin, coin2, plan], 'DELETE /admin/reward-prizes/p1': { id: 'p1', deleted: true } });
    render(<RewardWheelPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Xoá 50 Coin' }));
    expect(within(screen.getByRole('dialog')).getByText(/rồi mới xoá được/)).toBeInTheDocument();
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Huỷ' }));

    await userEvent.click(screen.getByRole('button', { name: 'Xoá 30 ngày' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/không khôi phục/)).toBeInTheDocument();
    expect(called(fetchMock, 'DELETE', '/admin/reward-prizes/p1')).toBe(false);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Xoá vĩnh viễn' }));
    await waitFor(() => expect(called(fetchMock, 'DELETE', '/admin/reward-prizes/p1')).toBe(true));
  });
});
