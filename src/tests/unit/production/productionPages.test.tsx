import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectListPage } from '@/features/production/components/list/ProjectListPage';
import { ProjectDetailPage } from '@/features/production/components/project/ProjectDetailPage';
import { signInAs } from '@/tests/support/signIn';
import { useAppStore } from '@/store/useAppStore';
import type { ProjectDetail } from '@/types/production';

const nav = vi.hoisted(() => ({ pathname: '/reviewer/projects', params: {} as Record<string, string>, search: '' }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => nav.pathname,
  useParams: () => nav.params,
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const person = (id: string, fullName: string) => ({ id, fullName, email: `${id}@x.vn` });

const STUDIO = {
  id: 'st1',
  name: 'Studio Sao Mai',
  email: 'saomai@studio.vn',
  contactName: null,
  phone: null,
  note: null,
  isActive: true,
  createdAt: '2026-10-01T00:00:00.000Z',
};

function project(overrides: Partial<ProjectDetail> = {}): ProjectDetail {
  return {
    id: 'm1',
    title: 'Mưa Sài Gòn',
    ideaDescription: 'Một câu chuyện tình cảm giữa mùa mưa Sài Gòn.',
    synopsis: null,
    defaultLanguage: 'vi',
    ageRating: null,
    releaseYear: null,
    freeEpisodeCount: null,
    status: 'ASSIGNED',
    posterUrl: null,
    reviewerId: 'reviewer-id',
    creatorId: 'creator-id',
    reviewer: person('reviewer-id', 'Reviewer Một'),
    creator: person('creator-id', 'Creator Một'),
    studio: null,
    cancelReason: null,
    handedOffAt: null,
    completedAt: null,
    cancelledAt: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    genres: [{ id: 'g1', name: 'Tình cảm' }],
    seasons: [
      {
        id: 's1',
        seasonNumber: 1,
        title: 'Mùa 1',
        status: 'DRAFT',
        episodeProductionCost: 500,
        releaseStartDate: '2027-01-01T00:00:00.000Z',
        releaseEndDate: '2027-03-31T00:00:00.000Z',
        episodes: [
          {
            id: 'e1',
            movieId: 'm1',
            seasonId: 's1',
            assignedCreatorId: null,
            assignedCreator: null,
            episodeNumber: 1,
            title: 'Cơn mưa đầu',
            synopsis: null,
            thumbnailUrl: null,
            status: 'DRAFT',
            targetDurationSeconds: 1200,
            deliveryDeadline: '2026-12-31T00:00:00.000Z',
            dueDate: null,
            expectedReleaseDate: '2027-01-15T00:00:00.000Z',
            approvedMediaAssetId: null,
            coinPrice: null,
            revisionStartedAt: null,
            createdAt: '2026-10-01T00:00:00.000Z',
            updatedAt: '2026-10-01T00:00:00.000Z',
            mediaAssets: [],
          },
        ],
      },
    ],
    ideaFiles: [],
    studioHandoffs: [],
    creatorAssignments: [],
    productionFeeTokens: 500,
    seasonFees: [],
    openChangeRequests: 0,
    revision: { episodeCount: 0, bySeason: [] },
    ...overrides,
  };
}

/** Answers each API path with the given body; anything else is an empty list. */
function routeFetch(routes: Record<string, unknown>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const path = new URL(url, 'http://x').pathname.replace(/^\/api/, '');
      const body = path in routes ? routes[path] : [];
      return { ok: true, status: 200, json: async () => body };
    }),
  );
}

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState({ isAuthenticated: false, user: null });
});
afterEach(() => vi.unstubAllGlobals());

describe('ProjectListPage', () => {
  const page = {
    data: [
      {
        id: 'm1',
        title: 'Mưa Sài Gòn',
        status: 'IN_PRODUCTION',
        studio: STUDIO,
        reviewerId: 'reviewer-id',
        creatorId: 'creator-id',
        reviewer: person('reviewer-id', 'Reviewer Một'),
        creator: person('creator-id', 'Creator Một'),
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z',
        lastActivityAt: '2026-10-14T08:30:00.000Z',
        _count: { episodes: 8 },
      },
    ],
    meta: { totalItems: 1, currentPage: 1, totalPages: 1, itemsPerPage: 12 },
  };

  it('shows the projects and lets a Reviewer create one', async () => {
    nav.pathname = '/reviewer/projects';
    signInAs('reviewer');
    routeFetch({ '/projects': page });
    render(<ProjectListPage />);

    const card = (await screen.findByRole('heading', { name: 'Mưa Sài Gòn' })).closest('li')!;
    expect(within(card).getByText('Studio đang sản xuất')).toBeInTheDocument();
    expect(within(card).getByText('Studio Sao Mai')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tạo dự án/ })).toBeInTheDocument();
  });

  it('shows when each project last changed, with a tooltip explaining the column', async () => {
    nav.pathname = '/reviewer/projects';
    signInAs('reviewer');
    routeFetch({ '/projects': page });
    render(<ProjectListPage />);

    await screen.findByRole('heading', { name: 'Mưa Sài Gòn' });
    await userEvent.click(screen.getByRole('button', { name: 'Xem dạng bảng' }));
    const header = screen.getByRole('columnheader', { name: 'Cập nhật lần cuối' });
    expect(header).toHaveAttribute('title', expect.stringContaining('thay đổi gần nhất'));
    // The newest content event (14/10), not the project's own update time (01/10).
    expect(screen.getByText(/14\/10\/26/)).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Cập nhật' })).not.toBeInTheDocument();
  });

  it('gives a Creator no create button', async () => {
    nav.pathname = '/creator/projects';
    signInAs('creator');
    routeFetch({ '/projects': page });
    render(<ProjectListPage />);

    await screen.findByRole('heading', { name: 'Mưa Sài Gòn' });
    expect(screen.queryByRole('button', { name: /Tạo dự án/ })).not.toBeInTheDocument();
  });
});

describe('ProjectDetailPage', () => {
  it('offers the assigned Creator the studio hand-off, with the studio typed by hand', async () => {
    nav.pathname = '/creator/projects/m1';
    nav.params = { projectId: 'm1' };
    nav.search = 'tab=studio';
    signInAs('creator');
    useAppStore.setState((s) => ({ user: { ...s.user!, id: 'creator-id' } }));
    routeFetch({ '/projects/m1': project(), '/studios': [STUDIO], '/projects/m1/handoffs': [] });
    render(<ProjectDetailPage />);

    await userEvent.click(await screen.findByRole('button', { name: /Bàn giao cho Studio/ }));
    const dialog = await screen.findByRole('dialog');
    // Each episode is due on the Reviewer's deadline; the Creator only picks the studio, the scope and the files.
    expect(dialog).toHaveTextContent('Hạn giao của các tập sẽ bàn giao');
    expect(dialog).toHaveTextContent('31/12/2026');
    expect(within(dialog).queryByLabelText(/Hạn giao tập/)).not.toBeInTheDocument();
    const send = screen.getByRole('button', { name: 'Gửi brief' });
    expect(send).toBeDisabled();
    expect(within(dialog).queryByRole('combobox', { name: /Studio nhận brief/ })).not.toBeInTheDocument();
    await userEvent.type(await within(dialog).findByLabelText('Tên Studio'), 'Studio Ánh Trăng');
    expect(send).toBeDisabled();
    await userEvent.type(within(dialog).getByLabelText('Email Studio'), 'contact@anhtrang.studio');
    expect(send).toBeEnabled();
  });

  it('explains the studio timeline and the three states of project, season and episode', async () => {
    nav.pathname = '/reviewer/projects/m1';
    nav.params = { projectId: 'm1' };
    nav.search = 'tab=studio';
    signInAs('reviewer');
    routeFetch({ '/projects/m1': project(), '/projects/m1/handoffs': [] });
    render(<ProjectDetailPage />);

    expect(await screen.findByText(/Gửi brief PDF và tài liệu cho Studio đối tác qua email/)).toBeInTheDocument();
    const tiers = screen.getByLabelText('Trạng thái dự án, mùa và tập');
    expect(tiers).toHaveTextContent('Dự án');
    // The sample season has a single episode: it reads as a whole film.
    expect(tiers).toHaveTextContent('Phần 1 (trọn bộ)');
  });

  it('shows the season window, price and, per episode, Creator, prices and expected release date', async () => {
    nav.pathname = '/reviewer/projects/m1';
    nav.params = { projectId: 'm1' };
    nav.search = 'tab=episodes';
    signInAs('reviewer');
    useAppStore.setState((s) => ({ user: { ...s.user!, id: 'reviewer-id' } }));
    routeFetch({ '/projects/m1': project(), '/projects/m1/creators': [] });
    render(<ProjectDetailPage />);

    const season = await screen.findByRole('region', { name: 'Phần 1 (trọn bộ)' });
    expect(season).toHaveTextContent('01/01/2027 → 31/03/2027');
    expect(season).toHaveTextContent('đơn giá 500 Token/tập');
    expect(within(season).getByRole('columnheader', { name: 'Creator phụ trách' })).toBeInTheDocument();
    expect(within(season).getByRole('columnheader', { name: 'Giá sản xuất' })).toBeInTheDocument();
    expect(within(season).getByRole('columnheader', { name: 'Giá bán (Coin)' })).toBeInTheDocument();
    expect(within(season).getByRole('columnheader', { name: 'Ngày dự kiến phát hành' })).toBeInTheDocument();
    expect(within(season).queryByRole('columnheader', { name: 'Thời hạn' })).not.toBeInTheDocument();
    expect(within(season).getByText('15/01/2027')).toBeInTheDocument();
  });

  it('gives the Admin the decision on requests but no edit, cancel or reassign (BR-55)', async () => {
    nav.pathname = '/reviewer/projects/m1';
    nav.params = { projectId: 'm1' };
    nav.search = '';
    signInAs('admin');
    routeFetch({ '/projects/m1': project(), '/projects/m1/change-requests': [] });
    render(<ProjectDetailPage />);

    await screen.findByRole('heading', { name: 'Mưa Sài Gòn' });
    expect(screen.queryByRole('button', { name: /Huỷ dự án/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Đổi Creator/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: /Đề xuất cho Admin/ }));
    expect(await screen.findByText('Chưa có đề xuất nào.')).toBeInTheDocument();
    // The Admin decides requests; the form to send one is for the Reviewer and the Creators.
    expect(screen.queryByRole('button', { name: /Gửi đề xuất/ })).not.toBeInTheDocument();
  });

  it('lets the Reviewer in charge and a Creator of the team send the Admin a request', async () => {
    nav.pathname = '/reviewer/projects/m1';
    nav.params = { projectId: 'm1' };
    nav.search = 'tab=changes';
    signInAs('reviewer');
    useAppStore.setState((s) => ({ user: { ...s.user!, id: 'reviewer-id' } }));
    routeFetch({ '/projects/m1': project(), '/projects/m1/change-requests': [] });
    const { unmount } = render(<ProjectDetailPage />);
    expect(await screen.findByRole('button', { name: /Gửi đề xuất/ })).toBeDisabled();
    unmount();

    nav.pathname = '/creator/projects/m1';
    signInAs('creator');
    useAppStore.setState((s) => ({ user: { ...s.user!, id: 'second-id' } }));
    routeFetch({
      '/projects/m1': project({ creatorAssignments: [{ creatorId: 'second-id' } as never] }),
      '/projects/m1/change-requests': [],
    });
    render(<ProjectDetailPage />);
    expect(await screen.findByRole('button', { name: /Gửi đề xuất/ })).toBeInTheDocument();
  });

  it('lets the Reviewer in charge cancel and reassign', async () => {
    nav.pathname = '/reviewer/projects/m1';
    nav.params = { projectId: 'm1' };
    nav.search = '';
    signInAs('reviewer');
    useAppStore.setState((s) => ({ user: { ...s.user!, id: 'reviewer-id' } }));
    routeFetch({ '/projects/m1': project() });
    render(<ProjectDetailPage />);

    expect(await screen.findByRole('button', { name: /Đổi Creator/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Huỷ dự án/ })).toBeInTheDocument();
  });
});