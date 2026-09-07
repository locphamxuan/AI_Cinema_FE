/**
 * AI Cinema - Authentication Service
 */

import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { UserProfile, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';
import { storage, STORAGE_KEYS } from '@/lib/storage';

const MOCK_USER: UserProfile = {
  id: 'usr_premium_01',
  name: 'Trần Minh Huy',
  email: 'huy.cinema.vip@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'vip',
  isVIP: true,
  vipExpiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
  createdAt: '2026-01-15T08:00:00Z',
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(
      API_ROUTES.AUTH.LOGIN,
      credentials,
      { useMockFallback: true },
      () => {
        const token = 'mock_jwt_token_' + Date.now();
        storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
        storage.set(STORAGE_KEYS.USER_DATA, MOCK_USER);

        if (credentials.rememberMe) {
          storage.set(STORAGE_KEYS.REMEMBERED_EMAIL, credentials.email);
          storage.set(STORAGE_KEYS.REMEMBERED_PASSWORD, credentials.password);
        } else {
          storage.remove(STORAGE_KEYS.REMEMBERED_PASSWORD);
        }

        return {
          user: {
            ...MOCK_USER,
            email: credentials.email,
          },
          token,
        };
      }
    );
  },

  async register(credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(
      API_ROUTES.AUTH.REGISTER,
      credentials,
      { useMockFallback: true },
      () => {
        const token = 'mock_jwt_token_' + Date.now();
        const newUser: UserProfile = {
          ...MOCK_USER,
          id: 'usr_' + Date.now(),
          name: credentials.name,
          email: credentials.email,
          isVIP: false,
          role: 'user',
        };
        storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
        storage.set(STORAGE_KEYS.USER_DATA, newUser);
        return { user: newUser, token };
      }
    );
  },

  async logout(): Promise<ApiResponse<{ success: boolean }>> {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER_DATA);
    return apiClient.post<{ success: boolean }>(
      API_ROUTES.AUTH.LOGOUT,
      {},
      { useMockFallback: true },
      () => ({ success: true })
    );
  },

  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    const savedUser = storage.get<UserProfile | null>(STORAGE_KEYS.USER_DATA, null);
    return apiClient.get<UserProfile>(
      API_ROUTES.AUTH.PROFILE,
      { useMockFallback: true },
      () => savedUser || MOCK_USER
    );
  },
};
