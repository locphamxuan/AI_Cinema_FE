import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilmProfitTab } from '@/features/finance/FilmProfitTab';
import { RevenueShareTab } from '@/features/finance/RevenueShareTab';
import { RiskFlagsTab } from '@/features/finance/RiskFlagsTab';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { isPeriodOver, previousPeriod } from '@/services/financeService';
import { roi, vnd, watchTime } from '@/features/finance/financeFormat';
import { routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock('next/navigation', () => ({ usePathname: () => '/admin/finance' }));
afterEach(() => vi.unstubAllGlobals());

const page = <T,>(data: T[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 20 } });

const FILMS = {
  totals: { productionCostVnd: 150_000_000, revenueVnd: 120_000_000, profitVnd: -30_000_000, roiPercent: -20, breakEvenMovies: 0 },
  films: [
    { movieId: 'm1', title: 'Mưa Sài Gòn', projectStatus: 'COMPLETED', productionCostVnd: 150_000_000, unlockRevenueVnd: 90_000_000, refundedVnd: 2_000_000, planShareVnd: 30_000_000, revenueVnd: 120_000_000, profitVnd: -30_000_000, roiPercent: -20, breakEven: false },
    { movieId: 'm2', title: 'Phim chưa có chi phí', projectStatus: 'ASSIGNED', productionCostVnd: 0, unlockRevenueVnd: 0, refundedVnd: 0, planShareVnd: 0, revenueVnd: 0, profitVnd: 0, roiPercent: null, breakEven: false },
  ],
};

describe('Financial Dashboard formatting', () => {
  it('spells VND, shows "—" for a film without cost, and watch time as hours:minutes', () => {
    expect(vnd(1_500_000)).toBe('1.500.000 VND');
    expect(roi(null)).toBe('—');
    expect(roi(-20)).toBe('-20%');
    expect(watchTime(3725)).toBe('1:02');
  });

  it('takes last month in Vietnam time and only lets a finished month be allocated', () => {
    const now = new Date('2026-11-30T18:00:00Z'); // 01/12 01:00 in Vietnam
    expect(previousPeriod(now)).toBe('2026-11');
    expect(isPeriodOver('2026-11', now)).toBe(true);
    expect(isPeriodOver('2026-12', now)).toBe(false);
  });
});

describe('Profit & ROI tab', () => {
  it('reads /admin/finance/films and shows totals, the loss and "—" for a null ROI', async () => {
    const calls = routeFetch({ '/admin/finance/films': FILMS });
    render(<FilmProfitTab />);

    expect(await screen.findByText('Mưa Sài Gòn')).toBeInTheDocument();
    expect(calls[0].path).toBe('/admin/finance/films');
    const loss = screen.getAllByText('-30.000.000 VND');
    expect(loss.some((el) => el.className.includes('text-destructive'))).toBe(true);
    const row = screen.getByText('Phim chưa có chi phí').closest('tr')!;
    expect(within(row).getByText('—')).toBeInTheDocument();
  });

  it('filters films by name', async () => {
    routeFetch({ '/admin/finance/films': FILMS });
    render(<FilmProfitTab />);
    await userEvent.type(await screen.findByLabelText('Tìm theo tên phim'), 'mưa');
    expect(screen.queryByText('Phim chưa có chi phí')).not.toBeInTheDocument();
  });
});

describe('Monthly-plan revenue share tab', () => {
  it('reads the chosen month and re-runs it after confirming', async () => {
    signInAs('admin');
    const period = previousPeriod();
    const result = { period, monthlyPoolVnd: 1_000_000, totalWatchSeconds: 400, allocatedAt: '2026-11-01T00:05:00Z', movies: [{ movieId: 'm1', title: 'Mưa Sài Gòn', watchSeconds: 300, sharePercent: 75, allocatedVnd: 750_000 }] };
    const calls = routeFetch({
      '/admin/finance/revenue-allocations': { ...result, allocatedAt: null, movies: [] },
      [`/admin/finance/revenue-allocations/${period}/run`]: result,
    });
    render(<RevenueShareTab />);

    expect(await screen.findByText(/Tháng này chưa chia/)).toBeInTheDocument();
    expect(calls[0].search.get('period')).toBe(period);

    await userEvent.click(screen.getByRole('button', { name: /Chia lại tháng này/ }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Chia lại' }));

    expect(await screen.findByText('750.000 VND')).toBeInTheDocument();
    expect(calls.some((c) => c.path === `/admin/finance/revenue-allocations/${period}/run` && c.method === 'POST')).toBe(true);
  });

  it('hides the re-run button without finance:allocation.run', async () => {
    signInAs('admin', ['finance:report.read']);
    routeFetch({ '/admin/finance/revenue-allocations': { period: '2026-10', monthlyPoolVnd: 0, totalWatchSeconds: 0, allocatedAt: null, movies: [] } });
    render(<RevenueShareTab />);
    await screen.findByText(/Tháng này chưa chia/);
    expect(screen.queryByRole('button', { name: /Chia lại/ })).not.toBeInTheDocument();
  });
});

describe('Risk flags tab', () => {
  const flag = {
    id: 'f1', ruleCode: 'LARGE_TOP_UP', reason: 'Nạp 6000000 VND trong một lần', status: 'OPEN', reviewNote: null, reviewedAt: null, createdAt: '2026-11-10T00:00:00Z', reviewedBy: null,
    coinTransaction: { id: 't1', entryType: 'TOP_UP', mainAmount: 6000, bonusAmount: 0, rateVnd: 1000, createdAt: '2026-11-10T00:00:00Z', wallet: { id: 'w1', user: { id: 'u1', fullName: 'Nguyễn An', email: 'an@test.vn' } } },
  };

  it('lists OPEN flags with the VND value, scans and reviews with a note', async () => {
    signInAs('admin');
    const calls = routeFetch({
      '/admin/finance/risk/rules': [{ code: 'LARGE_TOP_UP', description: 'Nạp lớn trong một lần' }],
      '/admin/finance/risk/flags': page([flag]),
      '/admin/finance/risk/scan': { created: 2 },
      '/admin/finance/risk/flags/f1/review': { ...flag, status: 'CONFIRMED' },
    });
    render(<RiskFlagsTab />);

    expect(await screen.findByText('Nguyễn An')).toBeInTheDocument();
    expect(screen.getByText('6.000.000 VND')).toBeInTheDocument();
    const list = calls.find((c) => c.path === '/admin/finance/risk/flags')!;
    expect(list.search.get('filter.status')).toBe('$eq:OPEN');
    expect(list.search.get('sortBy')).toBe('createdAt:DESC');

    await userEvent.click(screen.getByRole('button', { name: /Quét ngay/ }));
    await waitFor(() => expect(calls.some((c) => c.path === '/admin/finance/risk/scan' && c.method === 'POST')).toBe(true));

    await userEvent.click(screen.getByRole('button', { name: 'Xác nhận rủi ro' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Ghi chú (tuỳ chọn)'), 'Đã gọi xác minh');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận rủi ro' }));

    await waitFor(() => {
      const sent = calls.find((c) => c.path === '/admin/finance/risk/flags/f1/review')!;
      expect(JSON.parse(sent.body as string)).toEqual({ decision: 'CONFIRMED', note: 'Đã gọi xác minh' });
    });
  });
});

describe('Admin menu', () => {
  it('shows "Tài chính" and "Chatbox AI" to an Admin holding the permissions', () => {
    signInAs('admin');
    render(<AdminSidebar />);
    expect(screen.getByRole('link', { name: 'Tài chính' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Chatbox AI' })).toBeInTheDocument();
  });

  it('hides them without finance:report.read and support:knowledge.manage', () => {
    signInAs('admin', []);
    render(<AdminSidebar />);
    expect(screen.queryByRole('link', { name: 'Tài chính' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Chatbox AI' })).toBeNull();
  });
});
