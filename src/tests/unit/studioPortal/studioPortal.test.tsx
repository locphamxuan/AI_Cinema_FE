import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudioPortalPage } from '@/features/studio-portal/components/StudioPortalPage';
import { studioPortalService } from '@/services/studioPortalService';
import type { PortalEpisode, StudioPortalOverview } from '@/types/studio-portal';

const TOKEN = 'a'.repeat(43);

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => `/studio/${TOKEN}`,
  useParams: () => ({ token: TOKEN }),
  useSearchParams: () => new URLSearchParams(),
}));

function episode(overrides: Partial<PortalEpisode> = {}): PortalEpisode {
  return {
    id: 'e1',
    episodeNumber: 1,
    title: 'Cơn mưa đầu',
    synopsis: null,
    targetDurationSeconds: 900,
    dueDate: '2026-11-15T00:00:00.000Z',
    status: 'AWAITING_MEDIA',
    latestDelivery: null,
    changesRequested: null,
    ...overrides,
  };
}

function overview(overrides: Partial<StudioPortalOverview> = {}, episodes = [episode()]): StudioPortalOverview {
  return {
    studio: {
      studioName: 'Studio Ánh Trăng',
      studioEmail: 'studio@x.vn',
      handedOffAt: '2026-10-02T00:00:00.000Z',
      response: null,
      respondedAt: null,
      declineReason: null,
    },
    project: {
      title: 'Mưa Sài Gòn',
      status: 'IN_PRODUCTION',
      ideaDescription: 'Một câu chuyện tình cảm giữa mùa mưa Sài Gòn.',
      genres: ['Tình cảm'],
      productionFeeTokens: 20000,
      creator: { fullName: 'Creator Một', email: 'creator@x.vn' },
    },
    canDeliver: false,
    seasons: [{ seasonNumber: 1, title: 'Mùa 1', episodes }],
    ideaFiles: [],
    ...overrides,
  };
}

/** Answers every portal call with `body` (or `status` for an invalid link) and records the requests. */
function mockFetch(body: unknown, status = 200) {
  const fetchMock = vi.fn(async () => ({ ok: status < 400, status, json: async () => body }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe('studioPortalService', () => {
  it('sends the answer to the link’s own endpoint', async () => {
    const fetchMock = mockFetch(overview());
    await studioPortalService.respond(TOKEN, { decision: 'DECLINE', reason: 'Lịch kín tới tháng 12.' });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain(`/studio-portal/${TOKEN}/response`);
    expect(JSON.parse(init.body as string)).toEqual({ decision: 'DECLINE', reason: 'Lịch kín tới tháng 12.' });
  });

  it('uploads a delivery as multipart with the AI Disclosure', async () => {
    const fetchMock = mockFetch({ id: 'a1', version: 1 }, 201);
    const file = new File(['video'], 'ep1.mp4', { type: 'video/mp4' });
    const disclosure = { aiTools: ['Kling'], aiGeneratedParts: ['video'], humanEdited: false, noRealPersonLikeness: true, noCopyrightedMaterial: true };
    await studioPortalService.uploadMedia(TOKEN, 'e1', file, { proposedLabelType: 'AI_GENERATED', aiDisclosure: disclosure });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain(`/studio-portal/${TOKEN}/episodes/e1/media/upload`);
    const form = init.body as FormData;
    expect(form.get('file')).toBe(file);
    expect(JSON.parse(form.get('aiDisclosure') as string)).toEqual(disclosure);
  });
});

describe('StudioPortalPage', () => {
  it('asks the studio to agree to the terms before taking the project', async () => {
    mockFetch(overview());
    render(<StudioPortalPage />);

    const accept = await screen.findByRole('button', { name: /Nhận dự án/ });
    expect(accept).toBeDisabled();
    await userEvent.click(screen.getByRole('checkbox', { name: /đồng ý các điều khoản/ }));
    expect(accept).toBeEnabled();
    // Nothing to deliver before accepting.
    expect(screen.queryByRole('button', { name: /Giao bản/ })).not.toBeInTheDocument();
  });

  it('shows what to fix and lets an accepted studio deliver again', async () => {
    const studio = { ...overview().studio, response: 'ACCEPTED' as const, respondedAt: '2026-10-02T01:00:00.000Z' };
    mockFetch(
      overview({ studio, canDeliver: true }, [
        episode({
          status: 'CHANGES_REQUESTED',
          latestDelivery: { id: 'a1', version: 1, ingestStatus: 'READY', failureReason: null, durationSeconds: 880, createdAt: '2026-10-02T02:00:00.000Z' },
          changesRequested: { comments: 'Phút 03:10 nhạc nền quá to.', createdAt: '2026-10-02T03:00:00.000Z' },
        }),
      ]),
    );
    render(<StudioPortalPage />);

    expect(await screen.findByText('Phút 03:10 nhạc nền quá to.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Giao bản mới/ }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('Khai báo và cam kết sử dụng AI của studio');
  });

  it('explains a link that no longer works', async () => {
    mockFetch({ message: 'This studio link is no longer valid' }, 404);
    render(<StudioPortalPage />);
    expect(await screen.findByText('Link không còn hiệu lực')).toBeInTheDocument();
  });
});
