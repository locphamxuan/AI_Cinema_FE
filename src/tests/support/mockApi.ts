import { vi } from 'vitest';
import { fakeResponse } from './fakeResponse';

/**
 * Routes each fetch by method and path (without the /api prefix) to a canned BE answer, e.g.
 * `{ 'GET /wallet': {...} }`. A route missing from the map answers 404; `null` answers an empty body.
 */
export function mockApi(routes: Record<string, unknown>) {
  const fetchMock = vi.fn((url: string, init?: RequestInit) => {
    const key = `${init?.method ?? 'GET'} ${new URL(url, 'http://x').pathname.replace(/^\/api/, '')}`;
    return Promise.resolve(key in routes ? fakeResponse(routes[key]) : fakeResponse(undefined, 404));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
