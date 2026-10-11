import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SubscriptionManager from '@/components/subscription/SubscriptionManager';
import { useAppStore } from '@/store/useAppStore';

const monthly = {
  id: 'plan-m',
  code: 'MONTHLY',
  name: 'Gói Tháng',
  description: null,
  period: 'MONTHLY',
  durationDays: 30,
  isFree: false,
  isActive: true,
  isFeatured: true,
  sortOrder: 1,
  features: {},
  priceCoins: 900,
};
const free = { ...monthly, id: 'plan-f', code: 'FREE', name: 'Gói Thường', isFree: true, priceCoins: 0 };

/** Routes each fetch by method and path to a canned BE answer. */
function mockApi(routes: Record<string, unknown>) {
  const fetchMock = vi.fn((url: string, init?: RequestInit) => {
    const key = `${init?.method ?? 'GET'} ${new URL(url, 'http://x').pathname.replace(/^\/api/, '')}`;
    const body = routes[key];
    const empty = body === null;
    return Promise.resolve({
      ok: key in routes,
      status: key in routes ? 200 : 404,
      json: async () => body,
      headers: new Headers(empty ? { 'content-length': '0' } : {}),
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('SubscriptionManager (MF-2 membership)', () => {
  beforeEach(() => {
    useAppStore.setState({ isAuthenticated: true, wallet: { mainCoin: 1000, bonusCoin: 0 } });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('offers only the paid plans on sale, priced in Coins', async () => {
    mockApi({ 'GET /subscriptions/me': null, 'GET /membership-plans': [monthly, free] });

    render(<SubscriptionManager />);

    expect(await screen.findByText('Đăng ký với 900 Coin')).toBeInTheDocument();
    expect(screen.getByText('Bạn đang dùng gói Thường')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Đăng ký với/ })).toHaveLength(1);
  });

  it('pays the quoted intent and updates the wallet from the BE answer', async () => {
    const fetchMock = mockApi({
      'GET /subscriptions/me': null,
      'GET /membership-plans': [monthly],
      'POST /subscriptions': { id: 'sub-1', status: 'PENDING' },
      'POST /subscriptions/sub-1/activate': {
        id: 'sub-1',
        status: 'ACTIVE',
        priceCoins: 900,
        charged: { mainCoins: 900, bonusCoins: 0 },
        mainBalance: 100,
        bonusBalance: 0,
        currentPeriodEnd: '2026-11-10T00:00:00.000Z',
      },
    });

    render(<SubscriptionManager />);
    fireEvent.click(await screen.findByText('Đăng ký với 900 Coin'));

    await waitFor(() => expect(useAppStore.getState().wallet).toEqual({ mainCoin: 100, bonusCoin: 0 }));
    const calls = fetchMock.mock.calls.map(([url, init]) => `${init?.method ?? 'GET'} ${url}`);
    expect(calls.some((c) => c.endsWith('/subscriptions/sub-1/activate'))).toBe(true);
  });
});
