import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RewardLadderPanel } from '@/features/billing-admin/components/RewardLadderPanel';
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

const rung = (id: string, code: string, streakDay: number, isActive = true) => ({
  id, code, name: `Ngày ${streakDay}`, streakDay, bonusCoins: 5, grantsSpin: streakDay === 7, isActive,
});
const bodyOf = (fetchMock: ReturnType<typeof mockApi>, method: string, path: string) => {
  const call = fetchMock.mock.calls.find(([url, init]) => init?.method === method && String(url).endsWith(path));
  return call ? JSON.parse(String(call[1]?.body)) : undefined;
};

describe('RewardLadderPanel: the 7-day check-in schedule', () => {
  it('makes a code no older (switched-off) rung holds and posts the clicked day', async () => {
    signInAs('admin');
    const fetchMock = mockApi({
      'GET /admin/reward-rules': [rung('r1', 'day_1', 1, false)],
      'POST /admin/reward-rules': rung('r2', 'day_1_2', 1),
    });
    render(<RewardLadderPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Đặt thưởng ngày 1' }));
    await userEvent.type(screen.getByLabelText('Số Coin thưởng'), '5');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu' }));

    await waitFor(() =>
      expect(bodyOf(fetchMock, 'POST', '/admin/reward-rules')).toMatchObject({ code: 'day_1_2', name: 'Ngày 1', streakDay: 1, bonusCoins: 5 }),
    );
  });

  it('shows each day with its Coins, the spin day and the week total', async () => {
    signInAs('admin');
    mockApi({ 'GET /admin/reward-rules': [rung('r1', 'day_1', 1), rung('r7', 'day_7', 7)] });
    render(<RewardLadderPanel />);

    expect(await screen.findByText('+1 lượt quay')).toBeInTheDocument();
    expect(screen.getByText('10 Coin thưởng')).toBeInTheDocument();
    expect(screen.getAllByText('Chưa có thưởng')).toHaveLength(5);
  });

  it('refuses more bonus Coins than the API takes for one day', async () => {
    signInAs('admin');
    mockApi({ 'GET /admin/reward-rules': [] });
    render(<RewardLadderPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Đặt thưởng ngày 1' }));
    await userEvent.type(screen.getByLabelText('Số Coin thưởng'), '100001');
    expect(screen.getByRole('alert')).toHaveTextContent('từ 1 đến 100.000');
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeDisabled();
  });

  it('will not reactivate a switched-off rung on a day another rung now holds', async () => {
    signInAs('admin');
    mockApi({ 'GET /admin/reward-rules': [rung('r1', 'day_1', 1), rung('r0', 'day_1_old', 1, false)] });
    render(<RewardLadderPanel />);

    const edits = await screen.findAllByRole('button', { name: 'Sửa ngày 1' });
    await userEvent.click(edits[1]);
    await userEvent.click(screen.getByRole('switch', { name: /Dùng thưởng này/ }));
    expect(screen.getByText(/Ngày 1 đã có thưởng đang dùng/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeDisabled();
  });

  it('lets the Admin switch off an active rung', async () => {
    signInAs('admin');
    const fetchMock = mockApi({
      'GET /admin/reward-rules': [rung('r1', 'day_1', 1)],
      'PATCH /admin/reward-rules/r1': rung('r1', 'day_1', 1, false),
    });
    render(<RewardLadderPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Sửa ngày 1' }));
    await userEvent.click(screen.getByRole('switch', { name: /Dùng thưởng này/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => expect(bodyOf(fetchMock, 'PATCH', '/admin/reward-rules/r1')).toMatchObject({ isActive: false }));
  });
});
