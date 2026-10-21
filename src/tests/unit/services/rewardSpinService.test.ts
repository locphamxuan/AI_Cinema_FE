import { afterEach, describe, expect, it, vi } from 'vitest';
import { rewardSpinService } from '@/services/rewardSpinService';

function mockFetch(...responses: { body: unknown; status?: number }[]) {
  const fetchMock = vi.fn();
  for (const { body, status = 200 } of responses) {
    fetchMock.mockResolvedValueOnce({ ok: status < 400, status, json: async () => body, headers: new Headers() });
  }
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const headerOf = (init: RequestInit, name: string) => (init.headers as Record<string, string>)[name];

describe('rewardSpinService', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('retrieves wheel status including available spins, prizes, and history', async () => {
    const mockStatus = {
      availableSpins: 2,
      prizes: [
        { id: 'p1', code: 'coin_50', name: '50 Coin', type: 'BONUS_COIN', bonusCoins: 50, planDays: null },
      ],
      history: [],
    };
    const fetchMock = mockFetch({ body: mockStatus });

    const res = await rewardSpinService.getWheelStatus();

    expect(res.success).toBe(true);
    expect(res.data.availableSpins).toBe(2);
    expect(res.data.prizes[0].code).toBe('coin_50');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/rewards\/spins$/);
  });

  it('spins the wheel with idempotency key header', async () => {
    const mockResult = {
      id: 'spin-1',
      status: 'USED',
      prize: { id: 'p1', code: 'coin_50', name: '50 Coin', type: 'BONUS_COIN' },
      bonusCoins: 50,
      planDays: null,
      bonusBalance: 150,
      mainBalance: 20,
      availableSpins: 1,
    };
    const fetchMock = mockFetch({ body: mockResult, status: 200 });

    const res = await rewardSpinService.spin('custom-key-123');

    expect(res.success).toBe(true);
    expect(res.data.bonusCoins).toBe(50);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/rewards\/spins$/);
    expect(init.method).toBe('POST');
    expect(headerOf(init, 'Idempotency-Key')).toBe('custom-key-123');
  });

  it('supports listing fixed reward prizes and editing a Coin amount', async () => {
    const fetchMock = mockFetch({ body: [{ id: 'p1', name: '50 Coin', weight: 11 }] }, { body: { id: 'p1', bonusCoins: 60 } });

    const listRes = await rewardSpinService.getAdminPrizes();
    expect(listRes.data[0].id).toBe('p1');

    const updateRes = await rewardSpinService.updatePrize('p1', { bonusCoins: 60 });
    expect(updateRes.data.bonusCoins).toBe(60);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
