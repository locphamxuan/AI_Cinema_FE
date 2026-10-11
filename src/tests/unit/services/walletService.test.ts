import { afterEach, describe, expect, it, vi } from 'vitest';
import { walletService } from '@/services/walletService';
import { episodeAccessService } from '@/services/episodeAccessService';
import { coinTopUpService } from '@/services/coinTopUpService';
import { getTodayDayIndex, VN_DAY_LABELS } from '@/lib/dateUtils';

/** Answers each fetch with the next queued response. */
function mockFetch(...responses: { body: unknown; status?: number }[]) {
  const fetchMock = vi.fn();
  for (const { body, status = 200 } of responses) {
    fetchMock.mockResolvedValueOnce({ ok: status < 400, status, json: async () => body, headers: new Headers() });
  }
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const headerOf = (init: RequestInit, name: string) => (init.headers as Record<string, string>)[name];

describe('MF-2 services', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('calculates day index properly for Vietnam weekdays', () => {
    const wed = new Date('2026-09-23T10:00:00');
    expect(getTodayDayIndex(wed)).toBe(2);
    expect(VN_DAY_LABELS[getTodayDayIndex(wed)]).toBe('T4');
    expect(VN_DAY_LABELS[getTodayDayIndex(new Date('2026-09-27T10:00:00'))]).toBe('CN');
  });

  it('maps the BE wallet balance to the store shape', async () => {
    const fetchMock = mockFetch({ body: { mainBalance: 40, bonusBalance: 15, version: 3, expiringBonus: [] } });

    const res = await walletService.getBalance();

    expect(fetchMock.mock.calls[0][0]).toMatch(/\/wallet$/);
    expect(res).toMatchObject({ success: true, data: { mainCoin: 40, bonusCoin: 15 } });
  });

  it('joins a plan in two calls: quote the intent, then pay it', async () => {
    const fetchMock = mockFetch(
      { body: { id: 'sub-1', status: 'PENDING' }, status: 201 },
      { body: { id: 'sub-1', status: 'ACTIVE', charged: { mainCoins: 900, bonusCoins: 0 } }, status: 201 },
    );

    const res = await episodeAccessService.joinPlan('plan-1', 'k1');

    expect(res).toMatchObject({ success: true, data: { status: 'ACTIVE' } });
    const [[quoteUrl, quote], [payUrl, pay]] = fetchMock.mock.calls as [string, RequestInit][];
    expect(quoteUrl).toMatch(/\/subscriptions$/);
    expect(JSON.parse(quote.body as string)).toEqual({ planId: 'plan-1' });
    expect(payUrl).toMatch(/\/subscriptions\/sub-1\/activate$/);
    expect(headerOf(pay, 'Idempotency-Key')).toBe('k1:pay');
  });

  it('stops at the quote when the BE refuses it', async () => {
    const fetchMock = mockFetch({ body: { error: { message: 'The member already has a running plan' } }, status: 409 });

    const res = await episodeAccessService.joinPlan('plan-1');

    expect(res.success).toBe(false);
    expect(res.statusCode).toBe(409);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('unlocks with an idempotency key on the BE purchase routes', async () => {
    const fetchMock = mockFetch({ body: { paidCoins: 25 }, status: 201 }, { body: { paidCoins: 200 }, status: 201 });

    await episodeAccessService.purchaseEpisode('ep-1', 'k-ep');
    await episodeAccessService.purchaseSeries('movie-1', 'k-series');

    const [[episodeUrl, episodeInit], [seriesUrl]] = fetchMock.mock.calls as [string, RequestInit][];
    expect(episodeUrl).toMatch(/\/episodes\/ep-1\/purchase$/);
    expect(headerOf(episodeInit, 'Idempotency-Key')).toBe('k-ep');
    expect(seriesUrl).toMatch(/\/movies\/movie-1\/series-purchase$/);
  });

  it('reads the gateway redirect from the flat top-up order', async () => {
    mockFetch({ body: { topUpId: 't1', status: 'PENDING', redirectUrl: 'https://pay.example/t1' }, status: 201 });

    const res = await coinTopUpService.createTopUp('VNPAY', 50_000);

    expect(res.data.redirectUrl).toBe('https://pay.example/t1');
  });
});
