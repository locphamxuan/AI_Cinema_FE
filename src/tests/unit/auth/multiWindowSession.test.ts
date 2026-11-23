import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authSession } from '@/lib/authSession';
import { apiClient } from '@/services/apiClient';
import { authService } from '@/services/authService';
import { useAppStore } from '@/store/useAppStore';
import { fakeResponse } from '@/tests/support/fakeResponse';

/**
 * The owner demos with three windows of one browser, signed in as Creator, Reviewer and Admin. localStorage is
 * shared by every window, sessionStorage belongs to one tab: each "window" below is its own sessionStorage.
 */
const TAB_KEY = 'ai_cinema_tab_session';
const windows = new Map<string, string | null>();

function switchTo(name: string): void {
  windows.set(current, sessionStorage.getItem(TAB_KEY));
  current = name;
  sessionStorage.clear();
  const saved = windows.get(name);
  if (saved) sessionStorage.setItem(TAB_KEY, saved);
}
let current = 'A';

const account = (id: string, role: string) => ({
  accessToken: `access-${id}`,
  refreshToken: `refresh-${id}`,
  user: { id, fullName: id, email: `${id}@aicinema.vn`, role, isActive: true },
});

async function signIn(name: string, id: string, role: string): Promise<void> {
  switchTo(name);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse(account(id, role))));
  const res = await useAppStore.getState().login(`${id}@aicinema.vn`, 'pw');
  expect(res.success).toBe(true);
}

/** The bearer token this window sends with its next request. */
async function tokenSentBy(name: string): Promise<string | undefined> {
  switchTo(name);
  const fetchMock = vi.fn().mockResolvedValue(fakeResponse({ ok: true }));
  vi.stubGlobal('fetch', fetchMock);
  await apiClient.get('/projects');
  return ((fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>).Authorization;
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  windows.clear();
  current = 'A';
  window.history.replaceState({}, '', '/creator/projects');
  useAppStore.setState({ isAuthenticated: false, user: null });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('three accounts in three windows of one browser', () => {
  it('lets each window keep sending its own account token after the others sign in', async () => {
    await signIn('A', 'creator', 'CONTENT_CREATOR');
    await signIn('B', 'reviewer', 'CONTENT_REVIEWER');
    await signIn('C', 'admin', 'ADMIN');

    // Before the fix every window sent the token of the last login (the Admin), so the Creator window got 403s.
    expect(await tokenSentBy('A')).toBe('Bearer access-creator');
    expect(await tokenSentBy('B')).toBe('Bearer access-reviewer');
    expect(await tokenSentBy('C')).toBe('Bearer access-admin');
    switchTo('A');
    expect(authService.getStoredUser()?.role).toBe('creator');
  });

  it('refreshes one window without touching the tokens of the others', async () => {
    await signIn('A', 'creator', 'CONTENT_CREATOR');
    await signIn('B', 'reviewer', 'CONTENT_REVIEWER');
    switchTo('A');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(fakeResponse({}, 401))
      .mockResolvedValueOnce(fakeResponse({ accessToken: 'access-creator-2', refreshToken: 'refresh-creator-2' }))
      .mockResolvedValueOnce(fakeResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    await apiClient.get('/projects');

    expect(JSON.parse((fetchMock.mock.calls[1][1] as RequestInit).body as string)).toEqual({ refreshToken: 'refresh-creator' });
    expect(await tokenSentBy('B')).toBe('Bearer access-reviewer');
    expect(await tokenSentBy('A')).toBe('Bearer access-creator-2');
  });

  it('signs one window out and leaves the other accounts signed in', async () => {
    await signIn('A', 'creator', 'CONTENT_CREATOR');
    await signIn('C', 'admin', 'ADMIN');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse(null, 204)));
    useAppStore.getState().logout();

    expect(authService.hasSession()).toBe(false);
    expect(await tokenSentBy('A')).toBe('Bearer access-creator');
  });

  it('keeps the signed-in account out of the store shared by all windows', async () => {
    await signIn('A', 'creator', 'CONTENT_CREATOR');
    expect(localStorage.getItem('ai_cinema_app_store') ?? '').not.toContain('creator@aicinema.vn');
  });
});

describe('new and duplicated tabs', () => {
  it('continues the latest login in a new tab, but opens the sign-in form on /login', async () => {
    await signIn('A', 'creator', 'CONTENT_CREATOR');
    switchTo('fresh');
    window.history.replaceState({}, '', '/login');
    expect(authService.hasSession()).toBe(false);
    window.history.replaceState({}, '', '/creator/projects');
    expect(authService.getStoredUser()?.email).toBe('creator@aicinema.vn');
  });

  it('switches a window cleanly when its session ends in a tab duplicated from it', async () => {
    await signIn('A', 'creator', 'CONTENT_CREATOR');
    const id = sessionStorage.getItem(TAB_KEY)!;
    const listener = vi.fn(() => useAppStore.getState().syncSession());
    const stop = authSession.subscribe(listener);

    // The duplicated tab signs out: the browser tells this one through a storage event.
    localStorage.removeItem(`ai_cinema_session:${id}`);
    window.dispatchEvent(new StorageEvent('storage', { key: `ai_cinema_session:${id}`, newValue: null }));
    stop();

    expect(listener).toHaveReturnedWith('ended');
    expect(useAppStore.getState().isAuthenticated).toBe(false);
  });

  it('ignores sessions of other windows changing', async () => {
    await signIn('A', 'creator', 'CONTENT_CREATOR');
    const listener = vi.fn();
    const stop = authSession.subscribe(listener);
    window.dispatchEvent(new StorageEvent('storage', { key: 'ai_cinema_session:someone-else', newValue: null }));
    stop();
    expect(listener).not.toHaveBeenCalled();
  });

  it('keeps a bounded number of sessions and drops the old shared tokens', () => {
    localStorage.setItem('ai_cinema_auth_token', 'legacy');
    for (let i = 0; i < 8; i += 1) authSession.start({ accessToken: `a${i}`, refreshToken: `r${i}` }, null);
    const records = Object.keys(localStorage).filter((key) => key.startsWith('ai_cinema_session:'));
    expect(records.length).toBeLessThanOrEqual(6);
    expect(localStorage.getItem('ai_cinema_auth_token')).toBeNull();
    expect(authSession.read()?.accessToken).toBe('a7');
  });
});
