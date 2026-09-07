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
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeader(): Record<string, string> {
    const token = storage.getString(STORAGE_KEYS.AUTH_TOKEN);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    mockFallbackFn?: () => Promise<T> | T
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    // If mock fallback is explicitly requested or running without backend
    const shouldFallback = options.useMockFallback ?? true;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
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
        throw new Error(`HTTP error! status: ${response.status}`);
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

  delete<T>(endpoint: string, options?: RequestOptions, mockFallbackFn?: () => Promise<T> | T) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' }, mockFallbackFn);
  }
}

export const apiClient = new ApiClient();
