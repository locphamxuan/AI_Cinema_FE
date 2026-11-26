import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService, redirectUrlFor, toUserProfile } from '@/services/authService';
import { authSession } from '@/lib/authSession';
import { fakeResponse } from '@/tests/support/fakeResponse';

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
  const fetchMock = vi.fn().mockResolvedValue({ ...fakeResponse(body, status), ok });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
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
    expect(authSession.read()).toMatchObject({ accessToken: 'access-token', refreshToken: 'refresh-token' });

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body as string).email).toBe('reviewer@aicinema.com');
  });

  it('reports the backend error and keeps no session on bad credentials', async () => {
    mockFetch({ message: 'Incorrect email or password' }, false, 401);

    const res = await authService.login({ email: 'reviewer@aicinema.com', password: 'wrong' });

    expect(res.success).toBe(false);
    expect(res.message).toBe('Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
    expect(authService.hasSession()).toBe(false);
  });

  it('clears the stored session on logout', async () => {
    mockFetch(session);
    await authService.login({ email: 'reviewer@aicinema.com', password: 'secret123' });

    const fetchMock = mockFetch(null, true, 204);
    authService.logout();

    expect(authService.hasSession()).toBe(false);
    expect(authService.getStoredUser()).toBeNull();
    // The refresh token is revoked on the API too, not only forgotten here.
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toContain('/auth/logout');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toEqual({ refreshToken: 'refresh-token' });
  });
});
