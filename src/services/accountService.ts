/** The signed-in account's own profile: details, edits and password (PATCH /auth/me, POST /auth/me/password). */
import { API_ROUTES } from '@/constants/apiRoutes';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import type { AuthRole } from '@/types/auth';
import { apiClient, type ApiResponse } from './apiClient';
import { toUserProfile } from './authService';

export interface AccountDetails {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  role: AuthRole;
  isActive: boolean;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AccountUpdate {
  fullName?: string;
  phoneNumber?: string | null;
  dateOfBirth?: string;
}

/** Same rule as the backend: 8 to 15 digits, an optional leading +, spaces or dots between. */
export const PHONE_PATTERN = /^\+?[0-9][0-9 .]{6,18}[0-9]$/;

function remember(account: AccountDetails): void {
  storage.set(STORAGE_KEYS.USER_DATA, toUserProfile(account));
}

export const accountService = {
  get: () => apiClient.get<AccountDetails>(API_ROUTES.AUTH.PROFILE),

  async update(input: AccountUpdate): Promise<ApiResponse<AccountDetails>> {
    const res = await apiClient.patch<AccountDetails>(API_ROUTES.AUTH.PROFILE, input);
    if (res.success) remember(res.data);
    return res;
  },

  /** Every other session is signed out; this one continues with the new tokens. */
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<unknown>> {
    const res = await apiClient.post<{ accessToken: string; refreshToken: string; user: AccountDetails }>(
      API_ROUTES.AUTH.CHANGE_PASSWORD,
      { currentPassword, newPassword },
    );
    if (res.success) {
      storage.set(STORAGE_KEYS.AUTH_TOKEN, res.data.accessToken);
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, res.data.refreshToken);
      remember(res.data.user);
    }
    return res;
  },
};