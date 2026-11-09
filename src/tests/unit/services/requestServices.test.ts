import { afterEach, describe, expect, it, vi } from 'vitest';
import { costRequestService } from '@/services/costRequestService';
import { notificationService } from '@/services/notificationService';
import { studioService } from '@/services/studioService';
import { changeRequestService, teamService } from '@/services/teamService';
import { fakeResponse } from '@/tests/support/fakeResponse';

function stubFetch() {
  const fetchMock = vi.fn().mockResolvedValue(fakeResponse({}));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const call = (fetchMock: ReturnType<typeof stubFetch>, i = 0) => {
  const [url, init] = fetchMock.mock.calls[i] as [string, RequestInit];
  return { url: new URL(url, 'http://x'), init };
};
const fields = (init: RequestInit) => Object.fromEntries((init.body as FormData).entries());

const proof = new File(['quote'], 'quote.pdf', { type: 'application/pdf' });

describe('request services', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends a cost request as multipart with only the amounts that are given', async () => {
    const fetchMock = stubFetch();
    await costRequestService.create('m1', { requestedVnd: 20_000_000, reason: 'Thêm cảnh quay', proof });
    await costRequestService.create('m1', { requestedVnd: 5, studioQuoteVnd: 8, handoffId: 'h1', reason: 'x', proof });

    const first = call(fetchMock);
    expect(first.url.pathname).toBe('/api/projects/m1/cost-requests');
    expect(first.init.method).toBe('POST');
    const sent = fields(first.init);
    expect(sent).toMatchObject({ requestedVnd: '20000000', reason: 'Thêm cảnh quay' });
    expect(sent).not.toHaveProperty('studioQuoteVnd');
    expect(sent).not.toHaveProperty('handoffId');
    expect((sent.proof as File).name).toBe('quote.pdf');
    expect(fields(call(fetchMock, 1).init)).toMatchObject({ studioQuoteVnd: '8', handoffId: 'h1' });
  });

  it('filters the cost request inbox by status and pages it', async () => {
    const fetchMock = stubFetch();
    await costRequestService.list(2, 20, 'OPEN');
    await costRequestService.forProject('m1');
    expect(call(fetchMock).url.search).toBe('?page=2&limit=20&status=OPEN');
    expect(call(fetchMock, 1).url.search).toBe('?page=1&limit=10');
  });

  it('sends a studio change with the fee and only the studio fields that are given', async () => {
    const fetchMock = stubFetch();
    await studioService.changeStudio('m1', { studioId: 's2', reason: 'Trễ hạn', offeredFeeVnd: 90_000_000, forfeitedVnd: 0 });
    const { url, init } = call(fetchMock);
    expect(url.pathname).toBe('/api/projects/m1/studio-change');
    expect(fields(init)).toEqual({ studioId: 's2', reason: 'Trễ hạn', offeredFeeVnd: '90000000' });
  });

  it('lists the studio catalog, optionally only the active ones', async () => {
    const fetchMock = stubFetch();
    await studioService.list();
    await studioService.list(true);
    expect(call(fetchMock).url.search).toBe('');
    expect(call(fetchMock, 1).url.search).toBe('?active=true');
  });

  it('sends a change request with its proof only when there is one', async () => {
    const fetchMock = stubFetch();
    await changeRequestService.propose('m1', { requestType: 'OTHER', content: 'Đổi tên phim', reason: 'Trùng tên' });
    expect(fields(call(fetchMock).init)).toEqual({ requestType: 'OTHER', content: 'Đổi tên phim', reason: 'Trùng tên' });
    await changeRequestService.approve('cr1');
    expect(call(fetchMock, 1).init.body).toBe(JSON.stringify({}));
  });

  it('adds a Creator with a note only when one is written, and hands an episode back to the team', async () => {
    const fetchMock = stubFetch();
    await teamService.addCreator('m1', 'c2');
    await teamService.assignEpisode('e1', null);
    expect(JSON.parse(call(fetchMock).init.body as string)).toEqual({ creatorId: 'c2' });
    expect(call(fetchMock, 1).init.method).toBe('PUT');
    expect(JSON.parse(call(fetchMock, 1).init.body as string)).toEqual({ creatorId: null });
  });

  it('filters notifications by type and unread state', async () => {
    const fetchMock = stubFetch();
    await notificationService.listByTypes(['SCRIPT_SUBMITTED', 'CONTRACT_SIGNED'], 2, 15, true);
    await notificationService.listByTypes([]);
    const params = call(fetchMock).url.searchParams;
    expect(params.get('filter.type')).toBe('$in:SCRIPT_SUBMITTED,CONTRACT_SIGNED');
    expect(params.get('filter.readAt')).toBe('$null');
    expect(params.get('page')).toBe('2');
    expect(call(fetchMock, 1).url.searchParams.has('filter.type')).toBe(false);
  });

  it('reads the unread count and marks notifications read', async () => {
    const fetchMock = stubFetch();
    await notificationService.getUnreadCount();
    await notificationService.markRead('n1');
    await notificationService.markAllRead();
    expect(fetchMock.mock.calls.map(([url, init]) => `${init.method} ${new URL(url, 'http://x').pathname}`)).toEqual([
      'GET /api/notifications/unread-count',
      'PATCH /api/notifications/n1/read',
      'PATCH /api/notifications/read-all',
    ]);
  });
});
