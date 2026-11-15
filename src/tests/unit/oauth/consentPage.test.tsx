import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConsentPage } from '@/features/oauth/ConsentPage';
import { apiClient } from '@/services/apiClient';
import { authorizeQueryFrom } from '@/services/oauthService';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { safeNext } from '@/lib/safeNext';
import { signInAs } from '@/tests/support/signIn';

const QUERY = {
  response_type: 'code',
  client_id: 'studio-web',
  redirect_uri: 'http://localhost:3100/api/auth/callback',
  scope: 'studio:portal',
  state: 'st-1',
  code_challenge: 'x'.repeat(43),
  code_challenge_method: 'S256',
};
const search = new URLSearchParams(QUERY);
const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace, push: replace }), useSearchParams: () => search }));

const CONSENT = {
  client: { clientId: 'studio-web', name: 'Studio Web' },
  scopes: [{ scope: 'studio:portal', description: 'Xem và ký hợp đồng, nộp tập phim' }],
  account: { id: 'u1', role: 'STUDIO', studioName: 'Lumen Studio' },
  redirectUri: QUERY.redirect_uri,
  state: 'st-1',
};

const assign = vi.fn();
const realLocation = window.location;

beforeEach(() => {
  replace.mockReset();
  assign.mockReset();
  localStorage.clear();
  Object.defineProperty(window, 'location', { configurable: true, value: { ...realLocation, assign } });
});
afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(window, 'location', { configurable: true, value: realLocation });
});

function signedIn() {
  storage.set(STORAGE_KEYS.AUTH_TOKEN, 'token');
  signInAs('studio', []);
}

describe('OAuth consent page', () => {
  it('sends a signed-out visitor to sign in, coming back to this exact URL', async () => {
    const get = vi.spyOn(apiClient, 'get');
    render(<ConsentPage />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith(`/login?next=${encodeURIComponent(`/oauth/authorize?${search}`)}`));
    expect(get).not.toHaveBeenCalled();
  });

  it('shows the app, the studio account and the scopes the backend describes', async () => {
    signedIn();
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ success: true, data: CONSENT });
    render(<ConsentPage />);

    expect(await screen.findByText('Studio Web muốn dùng tài khoản AI Cinema của bạn')).toBeInTheDocument();
    expect(screen.getByText('Lumen Studio')).toBeInTheDocument();
    expect(screen.getByText('Xem và ký hợp đồng, nộp tập phim')).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith(`/oauth/authorize?${new URLSearchParams(QUERY)}`);
  });

  it.each([
    ['Cho phép', true],
    ['Từ chối', false],
  ])('"%s" posts the whole query with approve and goes where the backend says', async (button, approve) => {
    signedIn();
    vi.spyOn(apiClient, 'get').mockResolvedValue({ success: true, data: CONSENT });
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ success: true, data: { redirectTo: 'http://localhost:3100/api/auth/callback?code=c1&state=st-1' } });
    render(<ConsentPage />);

    await userEvent.click(await screen.findByRole('button', { name: button }));

    expect(post).toHaveBeenCalledWith('/oauth/authorize', { ...QUERY, approve });
    await waitFor(() => expect(assign).toHaveBeenCalledWith('http://localhost:3100/api/auth/callback?code=c1&state=st-1'));
  });

  it('refuses an account that is not a studio, offering to sign out, and never redirects', async () => {
    signedIn();
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: false,
      data: null,
      statusCode: 403,
      rawDetails: { error: 'access_denied', error_description: 'This account cannot approve the requested scope' },
    });
    render(<ConsentPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Chỉ tài khoản Studio mới cấp quyền cho Studio Web được.');
    await userEvent.click(screen.getByRole('button', { name: /Đăng xuất/ }));
    expect(replace).toHaveBeenCalledWith(expect.stringMatching(/^\/login\?next=/));
    expect(assign).not.toHaveBeenCalled();
  });

  it('shows an error page, not a redirect, for a broken client or redirect_uri', async () => {
    signedIn();
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: false,
      data: null,
      statusCode: 400,
      rawDetails: { error: 'invalid_request', error_description: 'Unknown client or redirect_uri' },
    });
    render(<ConsentPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Liên kết đăng nhập từ Studio Web không hợp lệ');
    expect(assign).not.toHaveBeenCalled();
  });
});

describe('OAuth helpers', () => {
  it('keeps only the seven OAuth parameters of the query', () => {
    expect(authorizeQueryFrom(new URLSearchParams({ ...QUERY, extra: '1' }))).toEqual(QUERY);
  });

  it('accepts only an internal path as the place to go back to', () => {
    expect(safeNext('/oauth/authorize?a=1')).toBe('/oauth/authorize?a=1');
    expect(safeNext('//evil.example')).toBeNull();
    expect(safeNext('/\\evil.example')).toBeNull();
    expect(safeNext('https://evil.example')).toBeNull();
  });
});
