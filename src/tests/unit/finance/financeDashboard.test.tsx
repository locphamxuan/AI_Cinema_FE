import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RiskFlagsTab } from '@/features/finance/RiskFlagsTab';
import { AppShell } from '@/components/shell/AppShell';
import { FilmProfitTab, planCoverage } from '@/features/finance/FilmProfitTab';
import { day, roi, signTone, vnd } from '@/features/finance/financeFormat';
import { routeFetch } from '@/tests/support/routeFetch';
import { signInAs } from '@/tests/support/signIn';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/finance',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
afterEach(() => vi.unstubAllGlobals());

const page = <T,>(data: T[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 20 } });

const FILMS = {
  currentPeriod: '2026-11',
  lastSharedPeriod: '2026-10',
  totals: { productionCostVnd: 150_000_000, episodeSalesVnd: 90_000_000, planShareVnd: 30_000_000, revenueVnd: 120_000_000, profitVnd: -30_000_000, roiPercent: -20, marginPercent: -25, costedMovies: 1, brokeEvenMovies: 0 },
  films: [
    { movieId: 'm1', title: 'Mưa Sài Gòn', studioName: 'Studio Sen', createdAt: '2026-10-01T03:00:00Z', productionCostVnd: 150_000_000, episodeSalesVnd: 90_000_000, refundedVnd: 2_000_000, planShareVnd: 30_000_000, revenueVnd: 120_000_000, profitVnd: -30_000_000, roiPercent: -20, breakEven: 'NOT_YET' },
    { movieId: 'm2', title: 'Mưa Sài Gòn', studioName: null, createdAt: '2026-11-05T03:00:00Z', productionCostVnd: 0, episodeSalesVnd: 0, refundedVnd: 0, planShareVnd: 0, revenueVnd: 0, profitVnd: 0, roiPercent: null, breakEven: 'NO_COST' },
  ],
};

describe('Financial Dashboard formatting', () => {
  it('spells VND, shows "—" when there is nothing to divide by, colours gains and losses', () => {
    expect(vnd(1_500_000)).toBe('1.500.000 VND');
    expect(roi(null)).toBe('—');
    expect(roi(-20)).toBe('-20%');
    expect(signTone(5)).toBe('text-success');
    expect(signTone(-5)).toBe('text-destructive');
    expect(signTone(0)).toBe('');
    expect(day('2026-10-31T18:00:00Z')).toBe('01/11/2026');
  });

  it('says in plain words which months the monthly-plan column covers', () => {
    expect(planCoverage({ currentPeriod: '2026-11', lastSharedPeriod: '2026-10' })).toMatch(/gần nhất là tháng 10\/2026.*Tháng 11\/2026 đang diễn ra/);
    expect(planCoverage({ currentPeriod: '2026-11', lastSharedPeriod: null })).toMatch(/^Chưa có tháng nào/);
  });
});

describe('Profit per film', () => {
  it('reads /admin/finance/films and shows both revenue sources, the loss and a neutral state for a film without cost', async () => {
    const calls = routeFetch({ '/admin/finance/films': FILMS });
    render(<FilmProfitTab />);

    expect(await screen.findByText('Studio Sen · tạo ngày 01/10/2026')).toBeInTheDocument();
    expect(calls[0].path).toBe('/admin/finance/films');
    for (const name of ['Bán tập lẻ', 'Từ gói Tháng', 'Tổng doanh thu', 'Lợi nhuận', 'ROI']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    expect(screen.getByText('đã trừ hoàn 2.000.000 VND')).toBeInTheDocument();
    expect(screen.getByText(/gần nhất là tháng 10\/2026/)).toBeInTheDocument();
    const loss = screen.getAllByText('-30.000.000 VND');
    expect(loss.some((el) => el.className.includes('text-destructive'))).toBe(true);

    const noCost = screen.getByText('tạo ngày 05/11/2026').closest('tr')!;
    expect(within(noCost).getByText('Chưa có chi phí')).toBeInTheDocument();
    expect(within(noCost).getByText('—')).toBeInTheDocument();
    expect(within(noCost).queryByText('Đã hoà vốn')).toBeNull();
    expect(screen.getByText('Chưa hoà vốn')).toBeInTheDocument();
  });

  it('filters films by name or studio', async () => {
    routeFetch({ '/admin/finance/films': FILMS });
    render(<FilmProfitTab />);
    await userEvent.type(await screen.findByLabelText('Tìm theo tên phim hoặc studio'), 'sen');
    expect(screen.queryByText('tạo ngày 05/11/2026')).not.toBeInTheDocument();
    expect(screen.getByText('Studio Sen · tạo ngày 01/10/2026')).toBeInTheDocument();
  });

  it('shows an empty state without films', async () => {
    routeFetch({ '/admin/finance/films': { ...FILMS, lastSharedPeriod: null, films: [] } });
    render(<FilmProfitTab />);
    expect(await screen.findByText('Chưa có phim nào.')).toBeInTheDocument();
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
    // An icon-only control keeps its icon, so it is never an empty box.
    expect(screen.getByRole('button', { name: 'Mở ví của Nguyễn An' }).querySelector('svg')).not.toBeNull();
    const list = calls.find((c) => c.path === '/admin/finance/risk/flags')!;
    expect(list.search.get('filter.status')).toBe('$eq:OPEN');
    expect(list.search.get('sortBy')).toBe('createdAt:DESC');

    await userEvent.click(screen.getByRole('button', { name: /Kiểm tra ngay/ }));
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
    render(<AppShell area="admin"><div /></AppShell>);
    expect(screen.getByRole('link', { name: 'Tài chính' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Trợ lý AI' })).toBeInTheDocument();
  });

  it('hides them without finance:report.read and support:knowledge.manage', () => {
    signInAs('admin', []);
    render(<AppShell area="admin"><div /></AppShell>);
    expect(screen.queryByRole('link', { name: 'Tài chính' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Trợ lý AI' })).toBeNull();
  });
});
