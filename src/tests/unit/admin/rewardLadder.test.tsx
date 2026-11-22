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

describe('RewardLadderPanel: "Thêm ngày" edge cases', () => {
  it('suggests a code no older (switched-off) rung holds and posts it', async () => {
    signInAs('admin');
    const fetchMock = mockApi({
      'GET /admin/reward-rules': [rung('r1', 'day_1', 1, false)],
      'POST /admin/reward-rules': rung('r2', 'day_1_2', 1),
    });
    render(<RewardLadderPanel />);

    await userEvent.click(await screen.findByRole('button', { name: /Thêm ngày/ }));
    expect(screen.getByDisplayValue('day_1_2')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Tên mốc điểm danh'), 'Ngày đầu');
    await userEvent.type(screen.getByLabelText('Số Coin thưởng'), '5');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu cấu hình' }));

    await waitFor(() => expect(bodyOf(fetchMock, 'POST', '/admin/reward-rules')).toMatchObject({ code: 'day_1_2', streakDay: 1, bonusCoins: 5 }));
  });

  it('refuses a code already used, before the backend does', async () => {
    signInAs('admin');
    mockApi({ 'GET /admin/reward-rules': [rung('r1', 'day_1', 1)] });
    render(<RewardLadderPanel />);

    await userEvent.click(await screen.findByRole('button', { name: /Thêm ngày/ }));
    const code = screen.getByLabelText(/Mã định danh/);
    await userEvent.clear(code);
    await userEvent.type(code, 'DAY_1');
    expect(screen.getByText('Mã này đã được dùng cho một ngày khác.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lưu cấu hình' })).toBeDisabled();
  });

  it('will not reactivate a switched-off rung on a day another rung now holds', async () => {
    signInAs('admin');
    mockApi({ 'GET /admin/reward-rules': [rung('r1', 'day_1', 1), rung('r0', 'day_1_old', 1, false)] });
    render(<RewardLadderPanel />);

    const edits = await screen.findAllByRole('button', { name: 'Sửa ngày 1' });
    await userEvent.click(edits[1]);
    await userEvent.click(screen.getByLabelText('Kích hoạt lại ngày này'));
    expect(screen.getByText(/Ngày 1 đã có cấu hình đang dùng/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lưu cấu hình' })).toBeDisabled();
  });

  it('lets the Admin switch off an active rung', async () => {
    signInAs('admin');
    const fetchMock = mockApi({
      'GET /admin/reward-rules': [rung('r1', 'day_1', 1)],
      'PATCH /admin/reward-rules/r1': rung('r1', 'day_1', 1, false),
    });
    render(<RewardLadderPanel />);

    await userEvent.click(await screen.findByRole('button', { name: 'Sửa ngày 1' }));
    await userEvent.click(screen.getByLabelText(/Đang dùng/));
    await userEvent.click(screen.getByRole('button', { name: 'Lưu cấu hình' }));
    await waitFor(() => expect(bodyOf(fetchMock, 'PATCH', '/admin/reward-rules/r1')).toMatchObject({ isActive: false }));
  });
});
