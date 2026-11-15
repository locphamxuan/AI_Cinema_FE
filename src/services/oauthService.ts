/** MF-1: the consent step of Studio Web's OAuth 2.0 login (Authorization Code + PKCE), BE `oauth/authorize`. */
import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from './apiClient';

/** The query Studio Web sends, passed to the backend as is (snake_case, RFC 6749 §4.1.1). */
export const AUTHORIZE_PARAMS = [
  'response_type',
  'client_id',
  'redirect_uri',
  'scope',
  'state',
  'code_challenge',
  'code_challenge_method',
] as const;

export type AuthorizeParam = (typeof AUTHORIZE_PARAMS)[number];
export type AuthorizeQuery = Record<AuthorizeParam, string>;

export interface ConsentView {
  client: { clientId: string; name: string };
  scopes: { scope: string; description: string }[];
  account: { id: string; role: string; studioName: string | null };
  redirectUri: string;
  state: string;
}

/** An OAuth refusal keeps the RFC shape `{ error, error_description }`, not the platform envelope. */
export interface OAuthFailure {
  status?: number;
  error: string;
  description: string;
}

/** Only the seven OAuth parameters; the backend rejects any other field. */
export function authorizeQueryFrom(search: URLSearchParams): AuthorizeQuery {
  return Object.fromEntries(AUTHORIZE_PARAMS.map((key) => [key, search.get(key) ?? ''])) as AuthorizeQuery;
}

function failureOf(status: number | undefined, raw: unknown, fallback?: string): OAuthFailure {
  const body = (raw ?? {}) as { error?: unknown; error_description?: unknown };
  return {
    status,
    error: typeof body.error === 'string' ? body.error : status === 401 ? 'unauthorized' : 'server_error',
    description: typeof body.error_description === 'string' ? body.error_description : (fallback ?? ''),
  };
}

type Result<T> = { ok: true; data: T } | { ok: false; failure: OAuthFailure };

export const oauthService = {
  async describe(query: AuthorizeQuery): Promise<Result<ConsentView>> {
    const res = await apiClient.get<ConsentView>(`${API_ROUTES.OAUTH.AUTHORIZE}?${new URLSearchParams(query).toString()}`);
    return res.success ? { ok: true, data: res.data } : { ok: false, failure: failureOf(res.statusCode, res.rawDetails, res.message) };
  },

  /** Approve or deny; the backend answers where the browser goes next (never built here). */
  async decide(query: AuthorizeQuery, approve: boolean): Promise<Result<{ redirectTo: string }>> {
    const res = await apiClient.post<{ redirectTo: string }>(API_ROUTES.OAUTH.AUTHORIZE, { ...query, approve });
    return res.success ? { ok: true, data: res.data } : { ok: false, failure: failureOf(res.statusCode, res.rawDetails, res.message) };
  },
};

/** Vietnamese text for the refusals a person can meet on the consent page. */
export function oauthFailureText(failure: OAuthFailure): string {
  if (failure.error === 'access_denied') return 'Chỉ tài khoản Studio mới cấp quyền cho Studio Web được.';
  if (failure.error === 'invalid_scope') return 'Studio Web xin một quyền không hợp lệ.';
  if (failure.error === 'invalid_client' || failure.error === 'invalid_request' || failure.error === 'unsupported_response_type') {
    return 'Liên kết đăng nhập từ Studio Web không hợp lệ hoặc đã hỏng. Quay lại Studio Web và bấm đăng nhập lại.';
  }
  return 'Không mở được trang cấp quyền. Thử lại sau ít phút.';
}
