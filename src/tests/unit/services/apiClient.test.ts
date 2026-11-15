import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveApiBaseUrl } from '@/constants/apiRoutes';
import { apiClient } from '@/services/apiClient';
import { scriptService } from '@/services/scriptService';
import { STORAGE_KEYS } from '@/lib/storage';
import { fakeResponse } from '@/tests/support/fakeResponse';

/** A 200 answer whose body is exactly `text`, with no Content-Length (as through a proxy that drops it). */
const rawAnswer = (text: string) => ({ ...fakeResponse(undefined), text: async () => text });

const headersOf = (call: unknown[]) => (call[1] as RequestInit).headers as Record<string, string>;

describe('apiClient', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('reads a JSON body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse({ id: 'm1' })));
    await expect(apiClient.get('/projects/m1')).resolves.toMatchObject({ success: true, data: { id: 'm1' }, statusCode: 200 });
  });

  it('answers null for an empty body even without a Content-Length header', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(rawAnswer('')));
    await expect(apiClient.get('/projects/m1/script')).resolves.toMatchObject({ success: true, data: null });
  });

  it('answers null for a literal JSON null body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(rawAnswer('null')));
    await expect(apiClient.get('/projects/m1/script')).resolves.toMatchObject({ success: true, data: null });
  });

  it('reads a project without a script as no script, not as an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(rawAnswer('')));
    const res = await scriptService.get('m1');
    expect(res.success).toBe(true);
    expect(res.data).toBeNull();
  });

  it('does not read the body of a 204 No Content', async () => {
    const answer = fakeResponse(undefined, 204);
    const text = vi.spyOn(answer, 'text');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(answer));
    await expect(apiClient.post('/projects/m1/cancel')).resolves.toMatchObject({ success: true, data: null });
    expect(text).not.toHaveBeenCalled();
  });

  it('reports a malformed body as a failure instead of throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(rawAnswer('<html>')));
    const res = await apiClient.get('/projects');
    expect(res.success).toBe(false);
    expect(res.data).toBeNull();
  });

  it('reports a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(apiClient.get('/projects')).resolves.toMatchObject({ success: false, message: 'Failed to fetch' });
  });

  it('keeps the status and the reason of a refusal', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(fakeResponse({ error: { message: 'Not allowed', details: { reason: 'MEMBER_ROLE' } } }, 403)),
    );
    const res = await apiClient.get('/projects');
    expect(res).toMatchObject({ success: false, statusCode: 403, reason: 'MEMBER_ROLE' });
    expect(res.message).toBeTruthy();
  });

  it('sends the bearer token and a JSON content type, but no content type for a multipart body', async () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'jwt-1');
    const fetchMock = vi.fn().mockResolvedValue(fakeResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    await apiClient.patch('/projects/m1', { title: 'Mưa' });
    await apiClient.postForm('/projects/m1/poster', new FormData());

    expect(headersOf(fetchMock.mock.calls[0])).toMatchObject({ Authorization: 'Bearer jwt-1', 'Content-Type': 'application/json' });
    expect(JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string)).toEqual({ title: 'Mưa' });
    expect(headersOf(fetchMock.mock.calls[1])).toEqual({ Authorization: 'Bearer jwt-1' });
  });

  it('refreshes an expired token once and retries the request with the new one', async () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'old');
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'refresh-1');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(fakeResponse({ message: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(fakeResponse({ accessToken: 'new', refreshToken: 'refresh-2' }))
      .mockResolvedValueOnce(fakeResponse({ id: 'm1' }));
    vi.stubGlobal('fetch', fetchMock);

    const res = await apiClient.get('/projects/m1');

    expect(res).toMatchObject({ success: true, data: { id: 'm1' } });
    expect(fetchMock.mock.calls[1][0]).toContain('/auth/refresh');
    expect(headersOf(fetchMock.mock.calls[2]).Authorization).toBe('Bearer new');
    expect(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBe('refresh-2');
  });

  it('signs out locally when the refresh token is refused', async () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'old');
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'refresh-1');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(fakeResponse({}, 401)).mockResolvedValueOnce(fakeResponse({}, 401)),
    );

    const res = await apiClient.get('/projects');

    expect(res).toMatchObject({ success: false, statusCode: 401 });
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBeNull();
  });

  it('does not try to refresh after a failed sign-in', async () => {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'refresh-1');
    const fetchMock = vi.fn().mockResolvedValue(fakeResponse({ message: 'Invalid credentials' }, 401));
    vi.stubGlobal('fetch', fetchMock);
    await apiClient.post('/auth/login', { email: 'a@b.vn', password: 'x' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('downloads a file, null when it cannot be read', async () => {
    const blob = new Blob(['pdf']);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: true, status: 200, blob: async () => blob }).mockResolvedValueOnce({ ok: false, status: 404 }));
    await expect(apiClient.getBlob('/files/1')).resolves.toBe(blob);
    await expect(apiClient.getBlob('/files/2')).resolves.toBeNull();
  });
});

describe('resolveApiBaseUrl', () => {
  it('routes an empty or :3001 backend through the same-origin /api, and roots a relative one', () => {
    expect(resolveApiBaseUrl(undefined)).toBe('/api');
    expect(resolveApiBaseUrl('http://localhost:3001/api')).toBe('/api');
    expect(resolveApiBaseUrl('api')).toBe('/api');
    expect(resolveApiBaseUrl('/backend')).toBe('/backend');
    expect(resolveApiBaseUrl('https://api.aicinema.vn')).toBe('https://api.aicinema.vn');
  });
});
