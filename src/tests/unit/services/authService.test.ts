import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService, redirectUrlFor, toUserProfile } from '@/services/authService';
import { STORAGE_KEYS } from '@/lib/storage';

const session = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  user: {
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    email: 'reviewer@aicinema.com',
    fullName: 'Le Quoc Bao',
    role: 'CONTENT_REVIEWER' as const,
    isActive: true,
  },
};

function mockFetch(body: unknown, ok = true, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('maps backend roles onto the UI role model', () => {
    expect(toUserProfile(session.user).role).toBe('reviewer');
    expect(toUserProfile({ ...session.user, role: 'CONTENT_CREATOR' }).role).toBe('creator');
    expect(toUserProfile({ ...session.user, role: 'MEMBER' }).role).toBe('user');
  });

  it('sends creators and reviewers to their workspace after login', () => {
    expect(redirectUrlFor('creator')).toBe('/creator/projects');
    expect(redirectUrlFor('reviewer')).toBe('/reviewer');
    expect(redirectUrlFor('user')).toBeUndefined();
  });

  it('stores the tokens so later requests are authenticated', async () => {
    const fetchMock = mockFetch(session);

    const res = await authService.login({ email: 'Reviewer@AiCinema.com ', password: 'secret123' });

    expect(res.success).toBe(true);
    expect(res.data.name).toBe('Le Quoc Bao');
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('access-token');
    expect(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBe('refresh-token');

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body as string).email).toBe('reviewer@aicinema.com');
  });

  it('reports the backend error and keeps no session on bad credentials', async () => {
    mockFetch({ message: 'Incorrect email or password' }, false, 401);

    const res = await authService.login({ email: 'reviewer@aicinema.com', password: 'wrong' });

    expect(res.success).toBe(false);
    expect(res.message).toBe('Incorrect email or password');
    expect(authService.hasSession()).toBe(false);
  });

  it('clears the stored session on logout', async () => {
    mockFetch(session);
    await authService.login({ email: 'reviewer@aicinema.com', password: 'secret123' });

    authService.logout();

    expect(authService.hasSession()).toBe(false);
    expect(authService.getStoredUser()).toBeNull();
  });
});
