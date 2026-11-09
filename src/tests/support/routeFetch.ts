import { vi } from 'vitest';
import { fakeResponse } from './fakeResponse';

/**
 * Answers each API path with the given body (anything else is an empty list) and records the calls,
 * so a test can check what a screen sent.
 */
export function routeFetch(routes: Record<string, unknown>) {
  const calls: { path: string; method: string; body: unknown }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const path = new URL(url, 'http://x').pathname.replace(/^\/api/, '');
      calls.push({ path, method: init?.method ?? 'GET', body: init?.body });
      const body = path in routes ? routes[path] : [];
      return fakeResponse(body);
    }),
  );
  return calls;
}
