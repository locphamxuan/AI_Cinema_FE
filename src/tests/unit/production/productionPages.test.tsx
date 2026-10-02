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

function project(overrides: Partial<ProjectDetail> = {}): ProjectDetail {
  return {
    id: 'm1',
    title: 'Mưa Sài Gòn',
    ideaDescription: 'Một câu chuyện tình cảm giữa mùa mưa Sài Gòn.',
    synopsis: null,
    defaultLanguage: 'vi',
    ageRating: null,
    releaseYear: null,
    status: 'ASSIGNED',
    posterUrl: null,
    reviewerId: 'reviewer-id',
    creatorId: 'creator-id',
    reviewer: person('reviewer-id', 'Reviewer Một'),
    creator: person('creator-id', 'Creator Một'),
    studioName: null,
    studioEmail: null,
    studioContact: null,
    cancelReason: null,
    assignedAt: null,
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
        episodes: [
          {
            id: 'e1',
            movieId: 'm1',
            seasonId: 's1',
            episodeNumber: 1,
            title: 'Cơn mưa đầu',
            synopsis: null,
            status: 'DRAFT',
            targetDurationSeconds: 1200,
            milestoneDate: '2026-12-31T00:00:00.000Z',
            dueDate: null,
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
    productionFeeTokens: 500,
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
        studioName: 'Studio Sao Mai',
        reviewerId: 'reviewer-id',
        creatorId: 'creator-id',
        reviewer: person('reviewer-id', 'Reviewer Một'),
        creator: person('creator-id', 'Creator Một'),
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z',
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

    const row = (await screen.findByText('Mưa Sài Gòn')).closest('tr')!;
    expect(within(row).getByText('Studio đang sản xuất')).toBeInTheDocument();
    expect(within(row).getByText('Studio Sao Mai')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tạo dự án/ })).toBeInTheDocument();
  });

  it('gives a Creator no create button', async () => {
    nav.pathname = '/creator/projects';
    signInAs('creator');
    routeFetch({ '/projects': page });
    render(<ProjectListPage />);

    await screen.findByText('Mưa Sài Gòn');
    expect(screen.queryByRole('button', { name: /Tạo dự án/ })).not.toBeInTheDocument();
  });
});

describe('ProjectDetailPage', () => {
  it('offers the assigned Creator the studio hand-off', async () => {
    nav.pathname = '/creator/projects/m1';
    nav.params = { projectId: 'm1' };
    nav.search = 'tab=studio';
    signInAs('creator');
    useAppStore.setState((s) => ({ user: { ...s.user!, id: 'creator-id' } }));
    routeFetch({ '/projects/m1': project() });
    render(<ProjectDetailPage />);

    await userEvent.click(await screen.findByRole('button', { name: /Bàn giao cho studio/ }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('Hạn giao từng tập');
    // The brief cannot go out before every episode has a due date.
    expect(screen.getByRole('button', { name: 'Gửi brief' })).toBeDisabled();
  });

  it('lets the Admin propose changes but not cancel or reassign (BR-55)', async () => {
    nav.pathname = '/reviewer/projects/m1';
    nav.params = { projectId: 'm1' };
    nav.search = '';
    signInAs('admin');
    routeFetch({ '/projects/m1': project(), '/projects/m1/change-requests': [] });
    render(<ProjectDetailPage />);

    await screen.findByRole('heading', { name: 'Mưa Sài Gòn' });
    expect(screen.queryByRole('button', { name: /Huỷ dự án/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Đổi Creator/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: /Đề xuất của Admin/ }));
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
