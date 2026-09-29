/**
 * AI Cinema - Centralized API Client with Mock Fallback & Interceptors
 */

import { API_BASE_URL } from '@/constants/apiRoutes';
import { storage, STORAGE_KEYS } from '@/lib/storage';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
}

export interface RequestOptions extends RequestInit {
  useMockFallback?: boolean;
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

  async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    mockFallbackFn?: () => Promise<T> | T
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const authHeaders = this.getAuthHeader();
    const headers = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
      ...(options._isRetry ? authHeaders : {}),
    };

    // Use real database by default in development and production environments.
    // In vitest unit tests (where no local server is listening), fallback allows offline testing.
    const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
    const shouldFallback = options.useMockFallback ?? isTest;

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
            return this.request<T>(endpoint, { ...options, _isRetry: true }, mockFallbackFn);
          }
        }
        if (shouldFallback && mockFallbackFn) {
          try {
            const fallbackData = await mockFallbackFn();
            return { success: true, data: fallbackData, statusCode: 200, message: 'Fallback to mock' };
          } catch (fallbackErr) {
            return {
              success: false,
              data: null as unknown as T,
              message: fallbackErr instanceof Error ? fallbackErr.message : 'Mock execution error',
            };
          }
        }
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errBody = await response.json();
          if (errBody?.message) {
            errorMessage = Array.isArray(errBody.message) ? errBody.message.join(', ') : errBody.message;
          }
        } catch {
          // non-JSON error body
        }
        return {
          success: false,
          data: null as unknown as T,
          message: errorMessage,
          statusCode: response.status,
        };
      }

      const data = await response.json();
      return { success: true, data, statusCode: response.status };
    } catch (error) {
      if (shouldFallback && mockFallbackFn) {
        try {
          const fallbackData = await mockFallbackFn();
          return { success: true, data: fallbackData, statusCode: 200, message: 'Fallback to mock' };
        } catch (fallbackErr) {
          return {
            success: false,
            data: null as unknown as T,
            message: fallbackErr instanceof Error ? fallbackErr.message : 'Mock execution error',
          };
        }
      }
      return {
        success: false,
        data: null as unknown as T,
        message: error instanceof Error ? error.message : 'Unknown network error',
      };
    }
  }

  get<T>(endpoint: string, options?: RequestOptions, mockFallbackFn?: () => Promise<T> | T) {
    return this.request<T>(endpoint, { ...options, method: 'GET' }, mockFallbackFn);
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions, mockFallbackFn?: () => Promise<T> | T) {
    return this.request<T>(
      endpoint,
      {
        ...options,
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      mockFallbackFn
    );
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions, mockFallbackFn?: () => Promise<T> | T) {
    return this.request<T>(
      endpoint,
      {
        ...options,
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      mockFallbackFn
    );
  }

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions, mockFallbackFn?: () => Promise<T> | T) {
    return this.request<T>(
      endpoint,
      {
        ...options,
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      },
      mockFallbackFn
    );
  }

  /** Plain-text resource behind auth, e.g. a WebVTT subtitle track; null when it cannot be read. */
  async getText(endpoint: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, { headers: this.getAuthHeader() });
      if (response.status === 401) {
        const refreshed = await this.tryRefreshToken();
        if (refreshed) {
          const retryRes = await fetch(`${this.baseUrl}${endpoint}`, { headers: this.getAuthHeader() });
          return retryRes.ok ? await retryRes.text() : null;
        }
      }
      return response.ok ? await response.text() : null;
    } catch {
      return null;
    }
  }

  delete<T>(endpoint: string, options?: RequestOptions, mockFallbackFn?: () => Promise<T> | T) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' }, mockFallbackFn);
  }
}

export const apiClient = new ApiClient();
