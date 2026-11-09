/**
 * AI Cinema - the one API client: same-origin /api, bearer token, refresh on 401, error messages in Vietnamese.
 */

import { API_BASE_URL } from '@/constants/apiRoutes';
import { localizeApiError } from '@/lib/applicationMessages';
import { storage, STORAGE_KEYS } from '@/lib/storage';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
  /** The backend `details.reason` of a refusal, for screens that react to a specific one. */
  reason?: string;
}

export interface RequestOptions extends RequestInit {
  _isRetry?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeader(): Record<string, string> {
    const token = storage.getString(STORAGE_KEYS.AUTH_TOKEN);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async tryRefreshToken(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const refreshToken = storage.getString(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) return false;

      try {
        const res = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
          storage.remove(STORAGE_KEYS.AUTH_TOKEN);
          storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
          storage.remove(STORAGE_KEYS.USER_DATA);
          return false;
        }

        const body = await res.json();
        const session = body?.data ?? body;
        if (session?.accessToken) {
          storage.set(STORAGE_KEYS.AUTH_TOKEN, session.accessToken);
          if (session.refreshToken) {
            storage.set(STORAGE_KEYS.REFRESH_TOKEN, session.refreshToken);
          }
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    let url = `${this.baseUrl}${endpoint}`;
    // Never make direct calls to port 3001 from the browser - route to same-origin /api
    if (url.includes('3001')) {
      url = url.replace(/https?:\/\/[^/]+:3001(\/api)?/, '/api');
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (typeof window !== 'undefined') {
        url = `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
      } else {
        const port = process.env.PORT || 3000;
        url = `http://localhost:${port}${url.startsWith('/') ? '' : '/'}${url}`;
      }
    }
    const authHeaders = this.getAuthHeader();
    // A FormData body sets its own multipart boundary.
    const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers = {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...authHeaders,
      ...options.headers,
      ...(options._isRetry ? authHeaders : {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // Automatically attempt token refresh on 401 Unauthorized
        if (
          response.status === 401 &&
          !options._isRetry &&
          !endpoint.includes('/auth/login') &&
          !endpoint.includes('/auth/refresh')
        ) {
          const refreshed = await this.tryRefreshToken();
          if (refreshed) {
            return this.request<T>(endpoint, { ...options, _isRetry: true });
          }
        }
        let rawMessage: unknown;
        let rawDetails: unknown;
        try {
          const errBody = await response.json();
          rawMessage = errBody?.error?.message ?? errBody?.message ?? (typeof errBody?.error === 'string' ? errBody.error : undefined);
          rawDetails = errBody?.error?.details ?? errBody?.details;
        } catch {
          // Use the HTTP status fallback when the server returned an empty or non-JSON error body.
        }
        const errorMessage = localizeApiError(rawMessage, response.status, rawDetails, endpoint);
        const reason =
          typeof rawDetails === 'object' && rawDetails !== null && 'reason' in rawDetails
            ? String(rawDetails.reason)
            : undefined;

        return {
          success: false,
          data: null as unknown as T,
          message: errorMessage,
          statusCode: response.status,
          reason,
        };
      }

      // 204 No Content (assign, cancel, delete…) has no body to parse.
      const empty = response.status === 204 || response.headers?.get('content-length') === '0';
      const data = (empty ? null : await response.json()) as T;
      return { success: true, data, statusCode: response.status };
    } catch (error) {
      return {
        success: false,
        data: null as unknown as T,
        message: error instanceof Error ? error.message : 'Unknown network error',
      };
    }
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /** A request with a JSON body. */
  private send<T>(method: 'POST' | 'PUT' | 'PATCH', endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method, body: body ? JSON.stringify(body) : undefined });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.send<T>('POST', endpoint, body, options);
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.send<T>('PUT', endpoint, body, options);
  }

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.send<T>('PATCH', endpoint, body, options);
  }

  /** Multipart upload, e.g. an idea file or an episode video. */
  postForm<T>(endpoint: string, form: FormData) {
    return this.request<T>(endpoint, { method: 'POST', body: form });
  }

  /** File behind auth (a brief PDF, an idea file); null when it cannot be read. */
  async getBlob(endpoint: string): Promise<Blob | null> {
    const load = () => fetch(`${this.baseUrl}${endpoint}`, { headers: this.getAuthHeader() });
    try {
      let response = await load();
      if (response.status === 401 && (await this.tryRefreshToken())) response = await load();
      return response.ok ? await response.blob() : null;
    } catch {
      return null;
    }
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
