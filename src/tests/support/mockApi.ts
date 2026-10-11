import { vi } from 'vitest';

/**
 * Routes each fetch by method and path (without the /api prefix) to a canned BE answer, e.g.
 * `{ 'GET /wallet': {...} }`. A route missing from the map answers 404; `null` answers an empty body.
 */
export function mockApi(routes: Record<string, unknown>) {
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

/** `METHOD url` of every call the page made, to assert on what reached the BE. */
export const callsOf = (fetchMock: ReturnType<typeof mockApi>) =>
  fetchMock.mock.calls.map(([url, init]) => `${init?.method ?? 'GET'} ${url}`);
