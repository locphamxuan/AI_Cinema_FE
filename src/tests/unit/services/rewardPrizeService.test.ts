import { afterEach, describe, expect, it, vi } from 'vitest';
import { rewardPrizeService } from '@/services/rewardPrizeService';
import { fakeResponse } from '@/tests/support/fakeResponse';

function mockFetch(...responses: { body: unknown; status?: number }[]) {
  const fetchMock = vi.fn();
  for (const { body, status = 200 } of responses) {
    fetchMock.mockResolvedValueOnce(fakeResponse(body, status));
  }
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('rewardPrizeService', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('supports listing fixed reward prizes and editing a Coin amount', async () => {
    const fetchMock = mockFetch({ body: [{ id: 'p1', name: '50 Coin', weight: 11 }] }, { body: { id: 'p1', bonusCoins: 60 } });

    const listRes = await rewardPrizeService.getAdminPrizes();
    expect(listRes.data[0].id).toBe('p1');

    const updateRes = await rewardPrizeService.updatePrize('p1', { bonusCoins: 60 });
    expect(updateRes.data.bonusCoins).toBe(60);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
