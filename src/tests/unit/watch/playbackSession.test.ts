import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { guestKey, playbackService, uuidV4 } from '@/services/playbackService';
import { adAdminService, adSlotProblem } from '@/services/adAdminService';
import { cuesReached } from '@/components/watch/useAdBreaks';
import { resumePointOf } from '@/components/watch/usePlaybackSession';
import { localizeApiError } from '@/lib/applicationMessages';
import { STORAGE_KEYS } from '@/lib/storage';
import type { AdScheduleItem } from '@/types/playback';

function mockFetch(...responses: { body: unknown; status?: number }[]) {
  const fetchMock = vi.fn();
  for (const { body, status = 200 } of responses) {
    fetchMock.mockResolvedValueOnce({ ok: status < 400, status, json: async () => body, headers: new Headers() });
  }
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const headerOf = (init: RequestInit, name: string) => (init.headers as Record<string, string>)[name];
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const cue = (breakId: string, positionSeconds: number): AdScheduleItem => ({
  breakId,
  positionSeconds,
  ad: { id: `ad-${breakId}`, title: 'Ad', mediaUrl: 'https://cdn/ad.mp4', clickUrl: null, durationSeconds: 15 },
});

describe('MF-3 playback session', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('makes a UUID v4 guest key and keeps it across calls', () => {
    expect(uuidV4()).toMatch(UUID_V4);
    const key = guestKey();
    expect(key).toMatch(UUID_V4);
    expect(guestKey()).toBe(key);
  });

  it('opens a guest session with X-Guest-Key and a member one without it', async () => {
    const fetchMock = mockFetch({ body: { sessionId: 's1' }, status: 201 }, { body: { sessionId: 's2' }, status: 201 });

    await playbackService.openSession('ep-1', 'k1');
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'token');
    await playbackService.openSession('ep-1', 'k2');

    const [guestUrl, guestInit] = fetchMock.mock.calls[0];
    expect(guestUrl).toMatch(/\/playback\/sessions$/);
    expect(JSON.parse(guestInit.body)).toEqual({ episodeId: 'ep-1' });
    expect(headerOf(guestInit, 'X-Guest-Key')).toMatch(UUID_V4);
    expect(headerOf(guestInit, 'Idempotency-Key')).toBe('k1');
    const memberInit = fetchMock.mock.calls[1][1];
    expect(headerOf(memberInit, 'X-Guest-Key')).toBeUndefined();
    expect(headerOf(memberInit, 'Authorization')).toBe('Bearer token');
  });

  it('reports the playhead on heartbeat, ad start and stop', async () => {
    const fetchMock = mockFetch({ body: { dueAdBreakId: 'b1' } }, { body: {} }, { body: {} });

    const beat = await playbackService.heartbeat('s1', 320, 0);
    await playbackService.adStarted('s1', 'b1', 321);
    await playbackService.stop('s1', 330);

    expect(beat.data.dueAdBreakId).toBe('b1');
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/playback\/sessions\/s1\/heartbeat$/);
    expect(fetchMock.mock.calls[0][1].method).toBe('PATCH');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ positionSeconds: 320, watchedSeconds: 0 });
    expect(fetchMock.mock.calls[1][0]).toMatch(/\/ad-breaks\/b1\/played$/);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ positionSeconds: 321 });
    expect(fetchMock.mock.calls[2][1].keepalive).toBe(true);
  });

  it('plays the nearest reached cue and passes the earlier ones a seek jumped over', () => {
    const schedule = [cue('a', 100), cue('b', 400), cue('c', 800)];
    expect(cuesReached(schedule, 50, new Set())).toBeNull();
    expect(cuesReached(schedule, 100, new Set())?.play.breakId).toBe('a');
    const seek = cuesReached(schedule, 900, new Set(['a']));
    expect(seek?.play.breakId).toBe('c');
    expect(seek?.passed).toEqual(['b', 'c']);
    expect(cuesReached(schedule, 900, new Set(['a', 'b', 'c']))).toBeNull();
  });

  it('asks about resuming only part-way through the episode', () => {
    const stream = { masterUrl: '', qualities: [], durationSeconds: 1000 };
    expect(resumePointOf({ stream })).toBeNull();
    expect(resumePointOf({ stream, resumePositionSeconds: 3 })).toBeNull();
    expect(resumePointOf({ stream, resumePositionSeconds: 320 })).toBe(320);
    expect(resumePointOf({ stream, resumePositionSeconds: 990 })).toBeNull();
  });

  it('explains the stream limit in Vietnamese', () => {
    expect(localizeApiError('Too many streams', 409, { reason: 'CONCURRENT_LIMIT_REACHED' }, '/playback/sessions')).toMatch(/nhiều thiết bị/);
  });
});

describe('Admin episode ad slots (BR-32)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('refuses duplicate seconds and cues past the end before saving', () => {
    expect(adSlotProblem([{ positionSeconds: 60 }, { positionSeconds: 300 }], 600)).toBeNull();
    expect(adSlotProblem([{ positionSeconds: 60 }, { positionSeconds: 60 }], 600)).toMatch(/trùng/);
    expect(adSlotProblem([{ positionSeconds: 600 }], 600)).toMatch(/nhỏ hơn/);
    expect(adSlotProblem([{ positionSeconds: 0 }], null)).toMatch(/từ 1/);
  });

  it('reads the paginated ads and replaces the cues of an episode', async () => {
    const fetchMock = mockFetch({ body: { data: [{ id: 'a1', title: 'Ad' }], meta: {} } }, { body: { mode: 'MANUAL' } });

    const ads = await adAdminService.ads();
    await adAdminService.saveSlots('ep-1', [{ positionSeconds: 120, adId: null }]);

    expect(ads.data).toEqual([{ id: 'a1', title: 'Ad' }]);
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toMatch(/\/admin\/episodes\/ep-1\/ad-slots$/);
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body)).toEqual({ slots: [{ positionSeconds: 120, adId: null }] });
  });
});
