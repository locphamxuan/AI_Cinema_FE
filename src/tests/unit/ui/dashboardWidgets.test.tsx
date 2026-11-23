import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { StatCard } from '@/components/data/StatCard';
import { StageBar } from '@/components/data/StageBar';
import { GreetingCard } from '@/components/data/GreetingCard';
import { AdminOverviewDashboard } from '@/features/admin/components/AdminOverviewDashboard';
import { percentChange } from '@/features/admin/components/AdminOverviewKpis';
import { fakeResponse } from '@/tests/support/fakeResponse';
import { signInAs } from '@/tests/support/signIn';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/admin',
  useSearchParams: () => new URLSearchParams(),
}));
afterEach(() => vi.unstubAllGlobals());

const report = (coins: number, paidCycles: number) => ({
  from: '',
  to: '',
  totals: { paidCycles, coins, mainCoins: coins - 200, bonusCoins: 200 },
  byPlan: [{ plan: { id: 'p1', code: 'MONTH', name: 'Gói Tháng' }, cycles: paidCycles, coins, mainCoins: coins - 200, bonusCoins: 200 }],
});
const page = (data: unknown[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 100 } });

describe('dashboard widgets', () => {
  it('works out the change against the period before, and gives none without a base', () => {
    expect(percentChange(1200, 1000)).toBe(20);
    expect(percentChange(900, 1200)).toBe(-25);
    expect(percentChange(5, 0)).toBeNull();
    expect(percentChange(5, undefined)).toBeNull();
  });

  it('shows the change of a figure with what it is measured against', () => {
    const { rerender } = render(<StatCard label="Doanh thu gói" value="1.200" trend={{ delta: 12.5, label: 'so với 7 ngày trước đó' }} />);
    expect(screen.getByText('+12,5%')).toBeInTheDocument();
    expect(screen.getByText(/so với 7 ngày trước đó/)).toBeInTheDocument();
    rerender(<StatCard label="Doanh thu gói" value="0" trend={{ delta: null, label: 'so với 7 ngày trước đó' }} />);
    expect(screen.getByText('Chưa có số liệu kỳ trước để so sánh')).toBeInTheDocument();
  });

  it('names every stage of the bar with its count, so the split does not rest on colour', () => {
    render(
      <StageBar
        title="Tiến độ duyệt"
        headline={{ value: 5, label: 'hồ sơ bạn phụ trách' }}
        segments={[
          { label: 'Kịch bản chờ duyệt', value: 3, color: 'var(--viz-2)' },
          { label: 'Phim cần duyệt', value: 2, color: 'var(--viz-1)' },
          { label: 'Phim bản cuối', value: 0, color: 'var(--viz-3)' },
        ]}
      />,
    );
    const region = screen.getByRole('region', { name: 'Tiến độ duyệt' });
    const items = within(region).getAllByRole('listitem');
    expect(items.map((li) => li.textContent)).toEqual(['3Kịch bản chờ duyệt', '2Phim cần duyệt', '0Phim bản cuối']);
  });

  it('greets by name with the figures of the day', () => {
    render(<GreetingCard label="Hồ sơ Reviewer" name="Lan" figures={[{ label: 'Chờ bạn xử lý', value: 4 }]} />);
    expect(screen.getByRole('heading', { name: 'Xin chào, Lan' })).toBeInTheDocument();
    expect(screen.getByText('Chờ bạn xử lý').nextSibling).toHaveTextContent('4');
  });
});

describe('AdminOverviewDashboard', () => {
  it('reads revenue for the chosen period and the one before it, and shows the change', async () => {
    signInAs('admin');
    const today = new Date().toISOString().slice(0, 10);
    const calls: URLSearchParams[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        const parsed = new URL(url, 'http://x');
        const path = parsed.pathname.replace(/^\/api/, '');
        if (path === '/admin/reports/revenue') {
          calls.push(parsed.searchParams);
          return fakeResponse(parsed.searchParams.get('to')?.startsWith(today) ? report(1200, 6) : report(1000, 6));
        }
        if (path === '/projects') return fakeResponse(page([{ id: 'm1', title: 'Mưa Sài Gòn', status: 'COMPLETED', _count: { episodes: 4 } }]));
        return fakeResponse(page([]));
      }),
    );
    render(<AdminOverviewDashboard />);
    expect(await screen.findByText('+20%')).toBeInTheDocument();
    expect(calls).toHaveLength(2);
    const [current, previous] = calls[0].get('to')!.startsWith(today) ? calls : [calls[1], calls[0]];
    // The period before ends the day before the chosen one starts.
    expect(previous.get('to')!.slice(0, 10) < current.get('from')!).toBe(true);
  });
});
