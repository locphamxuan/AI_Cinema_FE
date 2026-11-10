import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminExecutivePortal } from '@/features/admin/components/AdminExecutivePortal';
import { CreatorStudioPortal } from '@/features/production/components/creator/CreatorStudioPortal';
import { toScriptItem } from '@/features/production/components/creator/scriptItems';
import { ReviewerAuditWorkspace } from '@/features/reviewer/components/ReviewerAuditWorkspace';
import { ReviewerProjectQueuePage } from '@/features/reviewer/components/ReviewerProjectQueuePage';
import { filterQueue, toQueueItems } from '@/features/reviewer/reviewQueue';
import { assignedProject, STUDIO } from '@/tests/support/projectContext';
import { fakeResponse } from '@/tests/support/fakeResponse';
import { routeFetch } from '@/tests/support/routeFetch';
import type { PipelineScript, ProjectPipeline } from '@/services/pipelineService';
import { signInAs } from '@/tests/support/signIn';
import type { Episode, ProjectDetail, ProjectScript } from '@/types/production';

vi.mock('@/components/ui/Toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const nav = vi.hoisted(() => ({ search: '' }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/reviewer',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const pageOf = <T,>(data: T[]) => ({ data, meta: { totalItems: data.length, currentPage: 1, totalPages: 1, itemsPerPage: 50 } });
const script = (status: ProjectScript['status']) => ({ projectId: 'm1', status, currentVersion: 2, finalizedAt: null, versions: [], reviews: [] }) as ProjectScript;
const episode = (status: Episode['status'], extra: Partial<Episode> = {}) =>
  ({ id: 'e1', episodeNumber: 1, title: 'Tập đầu', status, coinPrice: 5, finalConfirmedAt: null, updatedAt: '2026-11-05T00:00:00.000Z', ...extra }) as Episode;
const project = (overrides: Partial<ProjectDetail> = {}) => ({ ...assignedProject({ genres: [{ id: 'g1', name: 'Kinh dị' }], posterUrl: null }), ...overrides }) as ProjectDetail;
const withEpisodes = (...episodes: Episode[]) => project({ status: 'IN_PRODUCTION', seasons: [{ id: 's1', episodes }] as never });
const VERSION_AT = '2026-11-02T00:00:00.000Z';
const rowScript = (status: PipelineScript['status']): PipelineScript => ({ status, currentVersion: 2, latestVersionAt: VERSION_AT });
/** A row of GET /projects/pipeline: an ASSIGNED project with no script, episode or open contract unless said otherwise. */
const row = (overrides: Partial<ProjectPipeline> = {}) => ({ ...project(), script: null, episodes: [], contract: null, ...overrides }) as unknown as ProjectPipeline;
const producing = (...episodes: Episode[]) => row({ status: 'IN_PRODUCTION', script: rowScript('FINAL'), episodes });
/** Makes one path answer 500, leaving the other routes of a stubbed fetch as they are. */
const failingPath = (path: string, next: typeof fetch): typeof fetch =>
  (async (url: RequestInfo | URL, init?: RequestInit) =>
    new URL(String(url), 'http://x').pathname === `/api${path}` ? fakeResponse({ message: 'boom' }, 500) : next(url, init)) as typeof fetch;
const isPerProjectRead = (path: string) => /^\/projects\/(?!pipeline$)[^/]+(\/(script|contracts))?$/.test(path);

beforeEach(() => {
  localStorage.clear();
  nav.search = '';
});
afterEach(() => vi.unstubAllGlobals());

describe('review queue', () => {
  it('turns scripts and films into work items, and keeps an idle project reachable', () => {
    const items = toQueueItems([
      row({ id: 'a', script: rowScript('SUBMITTED') }),
      producing(episode('IN_REVIEW'), episode('CHANGES_REQUESTED', { id: 'e2' }), episode('COMPLIANCE_PASSED', { id: 'e3', finalConfirmedAt: '2026-11-05T00:00:00.000Z' })),
      row({ id: 'idle' }),
    ]);
    expect(items.map((i) => i.stage)).toEqual(['SCRIPT_PENDING', 'MASTER_AUDIT', 'STUDIO_REVISING', 'FINAL_CONFIRMED', 'PROJECT']);
    expect(items[0].href).toBe('/reviewer/projects/a?tab=script');
    expect(items[0].updatedAt).toBe(VERSION_AT);
    expect(items[1].href).toBe('/reviewer?project=m1&episode=e1');
    expect(items[4].href).toBe('/reviewer/projects/idle');
    expect(filterQueue(items, 'revising', '').map((i) => i.id)).toEqual(['e2']);
    expect(filterQueue(items, 'all', 'lumen')).toHaveLength(5);
    expect(filterQueue(items, 'all', 'không có')).toHaveLength(0);
  });

  it('lists the real projects of the Reviewer with links into them', async () => {
    signInAs('reviewer');
    routeFetch({ '/projects/pipeline': pageOf([row({ script: rowScript('SUBMITTED') })]) });
    render(<ReviewerProjectQueuePage />);

    const link = await screen.findByRole('link', { name: /Thẩm Định Kịch Bản/ });
    expect(link).toHaveAttribute('href', '/reviewer/projects/m1?tab=script');
    expect(screen.getByRole('button', { name: 'Kịch bản chờ duyệt (1)' })).toBeInTheDocument();
  });

  it('opens the filter the sidebar asked for', async () => {
    nav.search = 'filter=revising';
    signInAs('reviewer');
    routeFetch({ '/projects/pipeline': pageOf([row({ script: rowScript('SUBMITTED') })]) });
    render(<ReviewerProjectQueuePage />);

    expect(await screen.findByText('Không có mục nào khớp bộ lọc.')).toBeInTheDocument();
  });
});

describe('ReviewerAuditWorkspace', () => {
  it('says so when no film waits, with the way to the queue', async () => {
    signInAs('reviewer');
    routeFetch({ '/projects/pipeline': pageOf([]) });
    render(<ReviewerAuditWorkspace />);

    expect(await screen.findByText('Chưa có bản phim nào chờ thẩm định')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem hàng đợi dự án' })).toHaveAttribute('href', '/reviewer/projects');
  });

  it('opens the film from the URL with its script and the Final Film action', async () => {
    nav.search = 'project=m1&episode=e1';
    signInAs('reviewer');
    routeFetch({
      '/projects/pipeline': pageOf([]),
      '/projects/m1': withEpisodes(episode('COMPLIANCE_PASSED')),
      '/episodes/e1/media': [],
      '/projects/m1/script': { ...script('FINAL'), versions: [{ id: 'v', version: 2, content: 'CẢNH MỞ ĐẦU', note: null, createdAt: '2026-11-01T00:00:00.000Z', submittedBy: { id: 'p', fullName: 'P' } }] },
      '/episodes/e1/publications': [],
      '/platform-settings': { episodeCoinPriceMin: 1, episodeCoinPriceMax: 50 },
    });
    render(<ReviewerAuditWorkspace />);

    expect(await screen.findByText('CẢNH MỞ ĐẦU')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Xác nhận Phim Final' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Phát hành ngay' })).not.toBeInTheDocument();
  });
});

describe('CreatorStudioPortal', () => {
  it('maps the real script status to the stage of each project', () => {
    expect(toScriptItem(row())).toMatchObject({ stage: 'DRAFT', step: 0, currentVersion: 0, totalEpisodes: 0 });
    expect(toScriptItem(row({ script: rowScript('REVIEWER_APPROVED') }))).toMatchObject({ stage: 'ADMIN_REVIEW', step: 2, currentVersion: 2 });
    expect(toScriptItem(row({ script: rowScript('FINAL') })).stage).toBe('NEGOTIATING');
    expect(toScriptItem(producing(episode('IN_REVIEW')))).toMatchObject({ stage: 'HANDED_OFF', currentVersion: 2, totalEpisodes: 1 });
  });

  it('shows only the projects from the API and offers no way to create one', async () => {
    signInAs('creator');
    const calls = routeFetch({ '/projects/pipeline': pageOf([row({ script: rowScript('REVISION_REQUESTED') })]) });
    render(<CreatorStudioPortal />);

    const list = await screen.findByRole('region', { name: 'Danh sách dự án' });
    expect(within(list).getByRole('link', { name: /Soạn Kịch Bản/ })).toHaveAttribute('href', '/creator/projects/m1?tab=script');
    expect(screen.getByText('Có kịch bản cần sửa theo góp ý')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Khởi tạo|Soạn Kịch Bản Mới/ })).not.toBeInTheDocument();
    expect(calls.map((c) => c.path)).toEqual(['/projects/pipeline']);
  });
});

describe('AdminExecutivePortal', () => {
  const round = { id: 'c1', status: 'STUDIO_SIGNED', round: 1, costVnd: 150_000_000, terms: 'Giao đúng hạn', studioSignedAt: '2026-11-04T00:00:00.000Z', studio: { id: STUDIO.id, name: 'Lumen Studio' } };
  const awaitingSignature = row({ script: rowScript('FINAL'), contract: round as never });
  const portal = (rows: ProjectPipeline[], extra: Record<string, unknown> = {}) =>
    routeFetch({
      '/projects': pageOf([]),
      '/projects/pipeline': pageOf(rows),
      '/projects/m1/costs': { budgetVnd: 200_000_000, committedVnd: 0, remainingVnd: 200_000_000, entries: [] },
      ...extra,
    });

  it('signs the real contract the studio signed', async () => {
    signInAs('admin');
    const calls = portal([awaitingSignature], { '/contracts/c1/sign': round });
    render(<AdminExecutivePortal />);

    await userEvent.click(await screen.findByRole('button', { name: /Xem Báo Giá/ }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Mưa Sài Gòn');
    expect(dialog).toHaveTextContent('Giao đúng hạn');
    await userEvent.click(within(dialog).getByRole('button', { name: /Đồng ý/ }));
    await waitFor(() => expect(calls.some((c) => c.path === '/contracts/c1/sign' && c.method === 'POST')).toBe(true));
  });

  it('counter-proposes within the budget left', async () => {
    signInAs('admin');
    const calls = portal([awaitingSignature], { '/contracts/c1/counter': round });
    render(<AdminExecutivePortal />);

    await userEvent.click(await screen.findByRole('button', { name: /Xem Báo Giá/ }));
    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByText(/ngân sách còn lại 200\.000\.000/)).toBeInTheDocument();
    const send = within(dialog).getByRole('button', { name: 'Gửi giá đề xuất' });
    await userEvent.type(within(dialog).getByLabelText('Giá đề xuất mới'), '900000000');
    expect(send).toBeDisabled();
    await userEvent.clear(within(dialog).getByLabelText('Giá đề xuất mới'));
    await userEvent.type(within(dialog).getByLabelText('Giá đề xuất mới'), '120000000');
    await userEvent.click(send);
    await waitFor(() => {
      const sent = calls.find((c) => c.path === '/contracts/c1/counter');
      expect(JSON.parse(sent!.body as string)).toEqual({ costVnd: 120_000_000 });
    });
  });

  it('publishes a confirmed Final Film and links a script waiting for the Final decision', async () => {
    signInAs('admin');
    const ready = { ...producing(episode('COMPLIANCE_PASSED', { finalConfirmedAt: '2026-11-05T00:00:00.000Z' })), id: 'm2' };
    const calls = portal([row({ script: rowScript('REVIEWER_APPROVED') }), ready], { '/episodes/e1/publications': { id: 'pub' } });
    render(<AdminExecutivePortal />);

    expect(await screen.findByRole('link', { name: 'Duyệt kịch bản: Mưa Sài Gòn' })).toHaveAttribute('href', '/admin/projects/m1?tab=script');
    expect(calls.filter((c) => c.path === '/projects/pipeline')).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: /Phát Hành Ngay/ }));
    await waitFor(() => expect(calls.some((c) => c.path === '/episodes/e1/publications' && c.method === 'POST')).toBe(true));
    expect(calls.filter((c) => isPerProjectRead(c.path))).toEqual([]);
  });

  it('leaves out a contract the studio has not signed yet', async () => {
    signInAs('admin');
    portal([row({ script: rowScript('FINAL'), contract: { ...round, status: 'SENT' } as never })]);
    render(<AdminExecutivePortal />);

    expect(await screen.findByText('Không có hợp đồng nào chờ Admin ký.')).toBeInTheDocument();
  });

  it('still lets the Admin sign when the budget cannot be read, but not counter-propose', async () => {
    signInAs('admin');
    portal([awaitingSignature]);
    vi.mocked(fetch).mockImplementation(failingPath('/projects/m1/costs', vi.mocked(fetch).getMockImplementation()!));
    render(<AdminExecutivePortal />);

    await userEvent.click(await screen.findByRole('button', { name: /Xem Báo Giá/ }));
    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Chưa thể đề xuất giá khác');
    await userEvent.type(within(dialog).getByLabelText('Giá đề xuất mới'), '120000000');
    expect(within(dialog).getByRole('button', { name: 'Gửi giá đề xuất' })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: /Đồng ý/ })).toBeEnabled();
  });

  it('shows why the portal could not load', async () => {
    signInAs('admin');
    portal([]);
    vi.mocked(fetch).mockImplementation(failingPath('/projects/pipeline', vi.mocked(fetch).getMockImplementation()!));
    render(<AdminExecutivePortal />);

    expect(await screen.findByRole('button', { name: /Thử lại/ })).toBeInTheDocument();
    expect(screen.queryByText('Không có hợp đồng nào chờ Admin ký.')).not.toBeInTheDocument();
  });
});
