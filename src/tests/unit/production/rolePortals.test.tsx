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
import { routeFetch } from '@/tests/support/routeFetch';
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

beforeEach(() => {
  localStorage.clear();
  nav.search = '';
});
afterEach(() => vi.unstubAllGlobals());

describe('review queue', () => {
  it('turns scripts and films into work items, and keeps an idle project reachable', () => {
    const items = toQueueItems([
      { project: project({ id: 'a' }), script: script('SUBMITTED') },
      { project: withEpisodes(episode('IN_REVIEW'), episode('CHANGES_REQUESTED', { id: 'e2' }), episode('COMPLIANCE_PASSED', { id: 'e3', finalConfirmedAt: '2026-11-05T00:00:00.000Z' })), script: script('FINAL') },
      { project: project({ id: 'idle' }), script: null },
    ]);
    expect(items.map((i) => i.stage)).toEqual(['SCRIPT_PENDING', 'MASTER_AUDIT', 'STUDIO_REVISING', 'FINAL_CONFIRMED', 'PROJECT']);
    expect(items[0].href).toBe('/reviewer/projects/a?tab=script');
    expect(items[1].href).toBe('/reviewer?project=m1&episode=e1');
    expect(items[4].href).toBe('/reviewer/projects/idle');
    expect(filterQueue(items, 'revising', '').map((i) => i.id)).toEqual(['e2']);
    expect(filterQueue(items, 'all', 'lumen')).toHaveLength(5);
    expect(filterQueue(items, 'all', 'không có')).toHaveLength(0);
  });

  it('lists the real projects of the Reviewer with links into them', async () => {
    signInAs('reviewer');
    routeFetch({ '/projects': pageOf([{ id: 'm1', status: 'ASSIGNED' }]), '/projects/m1': project(), '/projects/m1/script': script('SUBMITTED') });
    render(<ReviewerProjectQueuePage />);

    const link = await screen.findByRole('link', { name: /Thẩm Định Kịch Bản/ });
    expect(link).toHaveAttribute('href', '/reviewer/projects/m1?tab=script');
    expect(screen.getByRole('button', { name: 'Kịch bản chờ duyệt (1)' })).toBeInTheDocument();
  });

  it('opens the filter the sidebar asked for', async () => {
    nav.search = 'filter=revising';
    signInAs('reviewer');
    routeFetch({ '/projects': pageOf([{ id: 'm1', status: 'ASSIGNED' }]), '/projects/m1': project(), '/projects/m1/script': script('SUBMITTED') });
    render(<ReviewerProjectQueuePage />);

    expect(await screen.findByText('Không có mục nào khớp bộ lọc.')).toBeInTheDocument();
  });
});

describe('ReviewerAuditWorkspace', () => {
  it('says so when no film waits, with the way to the queue', async () => {
    signInAs('reviewer');
    routeFetch({ '/projects': pageOf([]) });
    render(<ReviewerAuditWorkspace />);

    expect(await screen.findByText('Chưa có bản phim nào chờ thẩm định')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem hàng đợi dự án' })).toHaveAttribute('href', '/reviewer/projects');
  });

  it('opens the film from the URL with its script and the Final Film action', async () => {
    nav.search = 'project=m1&episode=e1';
    signInAs('reviewer');
    routeFetch({
      '/projects': pageOf([]),
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
    expect(toScriptItem({ project: project(), script: null })).toMatchObject({ stage: 'DRAFT', step: 0, currentVersion: 0 });
    expect(toScriptItem({ project: project(), script: script('REVIEWER_APPROVED') })).toMatchObject({ stage: 'ADMIN_REVIEW', step: 2, currentVersion: 2 });
    expect(toScriptItem({ project: project(), script: script('FINAL') }).stage).toBe('NEGOTIATING');
    expect(toScriptItem({ project: project({ status: 'IN_PRODUCTION' }), script: script('FINAL') }).stage).toBe('HANDED_OFF');
  });

  it('shows only the projects from the API and offers no way to create one', async () => {
    signInAs('creator');
    routeFetch({ '/projects': pageOf([{ id: 'm1' }]), '/projects/m1': project(), '/projects/m1/script': script('REVISION_REQUESTED') });
    render(<CreatorStudioPortal />);

    const list = await screen.findByRole('region', { name: 'Danh sách dự án' });
    expect(within(list).getByRole('link', { name: /Soạn Kịch Bản/ })).toHaveAttribute('href', '/creator/projects/m1?tab=script');
    expect(screen.getByText('Có kịch bản cần sửa theo góp ý')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Khởi tạo|Soạn Kịch Bản Mới/ })).not.toBeInTheDocument();
  });
});

describe('AdminExecutivePortal', () => {
  const round = { id: 'c1', status: 'STUDIO_SIGNED', round: 1, costVnd: 150_000_000, terms: 'Giao đúng hạn', studioSignedAt: '2026-11-04T00:00:00.000Z', studio: { id: STUDIO.id, name: 'Lumen Studio' } };
  const signedProject = project();
  const portal = (rows: { detail: ProjectDetail; script: ProjectScript }, extra: Record<string, unknown> = {}) =>
    routeFetch({
      '/projects': pageOf([{ id: 'm1', status: rows.detail.status }]),
      '/projects/m1': rows.detail,
      '/projects/m1/script': rows.script,
      '/projects/m1/contracts': [round],
      ...extra,
    });

  it('signs the real contract the studio signed', async () => {
    signInAs('admin');
    const calls = portal({ detail: signedProject, script: script('FINAL') }, { '/contracts/c1/sign': round });
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
    const calls = portal({ detail: signedProject, script: script('FINAL') }, { '/contracts/c1/counter': round });
    render(<AdminExecutivePortal />);

    await userEvent.click(await screen.findByRole('button', { name: /Xem Báo Giá/ }));
    const dialog = await screen.findByRole('dialog');
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
    const producing = { ...withEpisodes(episode('COMPLIANCE_PASSED', { finalConfirmedAt: '2026-11-05T00:00:00.000Z' })), id: 'm2' };
    const calls = portal(
      { detail: signedProject, script: script('REVIEWER_APPROVED') },
      {
        '/projects': pageOf([{ id: 'm1', status: 'ASSIGNED' }, { id: 'm2', status: 'IN_PRODUCTION' }]),
        '/projects/m2': producing,
        '/episodes/e1/publications': { id: 'pub' },
      },
    );
    render(<AdminExecutivePortal />);

    expect(await screen.findByRole('link', { name: 'Duyệt kịch bản: Mưa Sài Gòn' })).toHaveAttribute('href', '/admin/projects/m1?tab=script');
    await userEvent.click(screen.getByRole('button', { name: /Phát Hành Ngay/ }));
    await waitFor(() => expect(calls.some((c) => c.path === '/episodes/e1/publications' && c.method === 'POST')).toBe(true));
    // Past ASSIGNED the script is settled, so the portal does not read it again.
    expect(calls.some((c) => c.path === '/projects/m2/script')).toBe(false);
  });
});
