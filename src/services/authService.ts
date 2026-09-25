/**
 * AI Cinema - Authentication Service
 * Directly connected to NestJS Backend Auth API & Neon PostgreSQL Database
 */

import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { UserProfile, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';
import { storage, STORAGE_KEYS } from '@/lib/storage';

export interface BEUserResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BELoginResponse {
  accessToken: string;
  user: BEUserResponse;
}

export interface BERegisterResponse {
  message: string;
  user: BEUserResponse;
}

/**
 * Maps Backend UserRole enum to Frontend role format
 */
export function mapBERoleToFE(beRole?: string): 'user' | 'vip' | 'admin' | 'creator' | 'reviewer' {
  switch (beRole) {
    case 'CONTENT_CREATOR':
      return 'creator';
    case 'CONTENT_REVIEWER':
      return 'reviewer';
    case 'ADMIN':
    case 'STAFF':
      return 'admin';
    default:
      return 'user';
  }
}

/**
 * Transforms Backend User data into Frontend UserProfile
 */
export function mapBEUserToFEProfile(beUser: BEUserResponse): UserProfile {
  const role = mapBERoleToFE(beUser.role);
  const isVIP = role === 'creator' || role === 'reviewer' || role === 'admin';
  return {
    id: beUser.id,
    name: beUser.fullName || beUser.email.split('@')[0],
    email: beUser.email,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(beUser.fullName || beUser.email)}`,
    role,
    isVIP,
    createdAt: beUser.createdAt,
  };
}

export const authService = {
  /**
   * Login with real Backend API (/api/auth/login).
   * Falls back to demo account profiles only for designated demo emails with password '1' if BE is offline.
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const trimmedEmail = credentials.email.trim().toLowerCase();

    // Call real Backend API first (no mock override)
    const res = await apiClient.post<BELoginResponse>(
      API_ROUTES.AUTH.LOGIN,
      {
        email: trimmedEmail,
        password: credentials.password,
      },
      { useMockFallback: false }
    );

    if (res.success && res.data?.accessToken && res.data?.user) {
      const userProfile = mapBEUserToFEProfile(res.data.user);
      const token = res.data.accessToken;

      let redirectUrl: string | undefined;
      if (userProfile.role === 'creator') {
        redirectUrl = '/creator/projects';
      } else if (userProfile.role === 'reviewer') {
        redirectUrl = '/reviewer';
      }

      storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
      storage.set(STORAGE_KEYS.USER_DATA, userProfile);

      if (credentials.rememberMe) {
        storage.set(STORAGE_KEYS.REMEMBERED_EMAIL, trimmedEmail);
        storage.set(STORAGE_KEYS.REMEMBERED_PASSWORD, credentials.password);
      } else {
        storage.remove(STORAGE_KEYS.REMEMBERED_PASSWORD);
      }

      return {
        success: true,
        data: {
          user: userProfile,
          token,
          redirectUrl,
        },
        statusCode: res.statusCode || 200,
      };
    }

    // Fallback solely for demo mock accounts if offline or demo accounts not yet seeded in DB
    if (credentials.password === '1') {
      let demoRole: 'user' | 'vip' | 'admin' | 'creator' | 'reviewer' | null = null;
      let demoName = '';
      let demoRedirect: string | undefined;

      if (trimmedEmail === 'creator@gmail.com') {
        demoRole = 'creator';
        demoName = 'Đạo diễn Trần Minh Huy (Maker)';
        demoRedirect = '/creator/projects';
      } else if (trimmedEmail === 'reviewer@gmail.com') {
        demoRole = 'reviewer';
        demoName = 'Thẩm định viên Lê Quốc Bảo (Checker)';
        demoRedirect = '/reviewer';
      } else if (trimmedEmail === 'vipdemo@gmail.com') {
        demoRole = 'vip';
        demoName = 'Phạm Xuân Lộc (Khán Giả VIP)';
      } else if (trimmedEmail === 'userdemo@gmail.com') {
        demoRole = 'user';
        demoName = 'Phạm Xuân Lộc (Khán Giả)';
      }

      if (demoRole) {
        const demoUser: UserProfile = {
          id: `demo-${demoRole}-01`,
          name: demoName,
          email: trimmedEmail,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${demoRole}`,
          role: demoRole,
          isVIP: demoRole === 'vip' || demoRole === 'creator' || demoRole === 'reviewer',
        };
        const token = 'mock_jwt_token_' + Date.now();
        storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
        storage.set(STORAGE_KEYS.USER_DATA, demoUser);

        return {
          success: true,
          data: {
            user: demoUser,
            token,
            redirectUrl: demoRedirect,
          },
          statusCode: 200,
          message: 'Đăng nhập thành công với tài khoản demo',
        };
      }
    }

    return {
      success: false,
      data: null as unknown as AuthResponse,
      message: res.message || 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!',
      statusCode: res.statusCode || 401,
    };
  },

  /**
   * Register with real Backend API (/api/auth/register) -> saves to PostgreSQL users table.
   */
  async register(credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> {
    const trimmedEmail = credentials.email.trim().toLowerCase();
    const trimmedName = credentials.name.trim();

    const res = await apiClient.post<BERegisterResponse>(
      API_ROUTES.AUTH.REGISTER,
      {
        email: trimmedEmail,
        password: credentials.password,
        fullName: trimmedName,
        role: 'MEMBER',
      },
      { useMockFallback: false }
    );

    if (res.success && res.data?.user) {
      const userProfile = mapBEUserToFEProfile(res.data.user);
      const token = 'token_' + userProfile.id;

      storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
      storage.set(STORAGE_KEYS.USER_DATA, userProfile);

      return {
        success: true,
        data: {
          user: userProfile,
          token,
        },
        statusCode: res.statusCode || 201,
        message: res.data.message || 'Đăng ký tài khoản thành công',
      };
    }

    return {
      success: false,
      data: null as unknown as AuthResponse,
      message: res.message || 'Đăng ký không thành công. Vui lòng thử lại!',
      statusCode: res.statusCode || 400,
    };
  },

  async logout(): Promise<ApiResponse<{ success: boolean }>> {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER_DATA);
    return {
      success: true,
      data: { success: true },
      statusCode: 200,
    };
  },

  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    const savedUser = storage.get<UserProfile | null>(STORAGE_KEYS.USER_DATA, null);
    if (savedUser) {
      return { success: true, data: savedUser, statusCode: 200 };
    }
    return apiClient.get<UserProfile>(
      API_ROUTES.AUTH.PROFILE,
      { useMockFallback: false }
    );
  },
};
