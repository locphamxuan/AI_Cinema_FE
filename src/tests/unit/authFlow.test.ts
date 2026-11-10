import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@/store/useAppStore';
import { authService } from '@/services/authService';
import { fakeResponse } from '@/tests/support/fakeResponse';

function backendAnswers(role: string) {
  return vi.fn().mockResolvedValue(
    fakeResponse({
      accessToken: 'jwt-access',
      refreshToken: 'jwt-refresh',
      user: { id: 'u-1', fullName: 'Alice', email: 'alice@example.com', role, isActive: true },
    }),
  );
}

describe('auth flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    useAppStore.getState().logout();
  });

  it('signs a back-office account in and points it at its area', async () => {
    const fetchMock = backendAnswers('CONTENT_REVIEWER');
    vi.stubGlobal('fetch', fetchMock);

    const result = await useAppStore.getState().login('alice@example.com', 'secret123');

    expect(result).toMatchObject({ success: true, redirectUrl: '/reviewer' });
    expect(fetchMock.mock.calls[0][0]).toEqual(expect.stringContaining('/api/auth/login'));
    expect(useAppStore.getState().isAuthenticated).toBe(true);
  });

  it('refuses a member on the web and keeps no session', async () => {
    vi.stubGlobal('fetch', backendAnswers('MEMBER'));

    const result = await useAppStore.getState().login('alice@example.com', 'secret123');

    expect(result.success).toBe(false);
    expect(result.error).toContain('ứng dụng di động');
    expect(useAppStore.getState().isAuthenticated).toBe(false);
    expect(authService.hasSession()).toBe(false);
  });

  it('refuses a studio account like a member: studios sign in to Studio Web', async () => {
    vi.stubGlobal('fetch', backendAnswers('STUDIO'));

    const result = await useAppStore.getState().login('studio@aicinema.com', 'Aicinema@123');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Studio Web');
    expect(useAppStore.getState().isAuthenticated).toBe(false);
    expect(authService.hasSession()).toBe(false);
  });

  it('drops a member session saved by an older version of the web', async () => {
    vi.stubGlobal('fetch', backendAnswers('MEMBER'));
    await authService.login({ email: 'alice@example.com', password: 'secret123' });
    expect(authService.hasSession()).toBe(true);

    useAppStore.getState().restoreSession();

    expect(useAppStore.getState().isAuthenticated).toBe(false);
    expect(authService.hasSession()).toBe(false);
  });
});
