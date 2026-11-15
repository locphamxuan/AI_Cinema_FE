import { vi } from 'vitest';
import { fakeResponse } from './fakeResponse';

const FAILURE = Symbol('failure');

/** A route answer that is a refusal: `status` with the backend's `message`, which the screen should show. */
export const failWith = (status: number, message: string) => ({ [FAILURE]: true, status, message });

const isFailure = (body: unknown): body is ReturnType<typeof failWith> =>
  typeof body === 'object' && body !== null && FAILURE in body;

/**
 * Answers each API path with the given body (anything else is an empty list) and records the calls,
 * so a test can check what a screen sent. `failWith(...)` makes a path answer an error.
 */
export function routeFetch(routes: Record<string, unknown>) {
  const calls: { path: string; method: string; body: unknown; search: URLSearchParams }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const parsed = new URL(url, 'http://x');
      const path = parsed.pathname.replace(/^\/api/, '');
      calls.push({ path, method: init?.method ?? 'GET', body: init?.body, search: parsed.searchParams });
      const body = path in routes ? routes[path] : [];
      return isFailure(body) ? fakeResponse({ message: body.message }, body.status) : fakeResponse(body);
    }),
  );
  return calls;
}
