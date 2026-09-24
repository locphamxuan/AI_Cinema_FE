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
        user: {
          id: 'user-123',
          name: 'Alice',
          email: 'alice@example.com',
          avatarUrl: 'https://example.com/avatar.png',
          role: 'user',
          isVIP: false,
        },
        token: 'jwt-token-123',
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const result = await useAppStore.getState().register('Alice', 'alice@example.com', 'secret123');

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, requestInit] = fetchMock.mock.calls[0];
    expect(url).toEqual(expect.stringContaining('/api/auth/register'));
    expect(requestInit).toMatchObject({ method: 'POST' });
    expect(JSON.parse(String(requestInit.body))).toMatchObject({
      fullName: 'Alice',
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret123',
      role: 'MEMBER',
    });
    expect(useAppStore.getState().isAuthenticated).toBe(true);
    expect(useAppStore.getState().user?.email).toBe('alice@example.com');
  });
});
