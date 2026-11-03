import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@/store/useAppStore';

describe('auth flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    useAppStore.getState().logout();
  });

  it('register calls the backend API and logs the user in', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        accessToken: 'jwt-access-123',
        refreshToken: 'jwt-refresh-123',
        user: { id: 'user-123', fullName: 'Alice', email: 'alice@example.com', role: 'MEMBER', isActive: true },
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const result = await useAppStore.getState().register('Alice', 'alice@example.com', 'secret123', '2000-05-14');

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, requestInit] = fetchMock.mock.calls[0];
    expect(url).toEqual(expect.stringContaining('/api/auth/register'));
    expect(requestInit).toMatchObject({ method: 'POST' });
    expect(JSON.parse(String(requestInit.body))).toMatchObject({
      fullName: 'Alice',
      email: 'alice@example.com',
      password: 'secret123',
      dateOfBirth: '2000-05-14',
    });
    expect(useAppStore.getState().isAuthenticated).toBe(true);
    expect(useAppStore.getState().user?.email).toBe('alice@example.com');
  });

  it('signs in with a Google token and keeps the session', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        accessToken: 'jwt-access',
        refreshToken: 'jwt-refresh',
        user: { id: 'u-1', fullName: 'Bob', email: 'bob@gmail.com', role: 'MEMBER', isActive: true },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await useAppStore.getState().loginWithGoogle('google-token', { dateOfBirth: '2000-01-01' });

    expect(result.success).toBe(true);
    const [url, requestInit] = fetchMock.mock.calls[0];
    expect(url).toEqual(expect.stringContaining('/api/auth/google'));
    expect(JSON.parse(String(requestInit.body))).toEqual({ idToken: 'google-token', dateOfBirth: '2000-01-01' });
    expect(useAppStore.getState().user?.email).toBe('bob@gmail.com');
  });

  it('passes the step a first Google sign-in still needs back to the screen', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({
          error: { message: 'Enter your date of birth', details: { reason: 'GOOGLE_SIGNUP_NEEDS_BIRTHDAY' } },
        }),
      }),
    );

    const result = await useAppStore.getState().loginWithGoogle('google-token');

    expect(result).toMatchObject({ success: false, reason: 'GOOGLE_SIGNUP_NEEDS_BIRTHDAY' });
    expect(result.error).toContain('ngày sinh');
    expect(useAppStore.getState().isAuthenticated).toBe(false);
  });
});
