/**
 * AI Cinema - Authentication Service (NestJS backend)
 */

import { apiClient, ApiResponse } from './apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { UserProfile, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { AREAS, homeAreaOf } from '@/lib/permissions';

/** Roles as the backend's UserRole enum spells them. */
export type BackendRole = 'MEMBER' | 'CONTENT_CREATOR' | 'CONTENT_REVIEWER' | 'STAFF' | 'ADMIN';

interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  role: BackendRole;
  isActive: boolean;
  permissions?: string[];
}

interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: BackendUser;
}

const ROLE_MAP: Record<BackendRole, UserProfile['role']> = {
  MEMBER: 'user',
  CONTENT_CREATOR: 'creator',
  CONTENT_REVIEWER: 'reviewer',
  STAFF: 'staff',
  ADMIN: 'admin',
};


export function toUserProfile(user: BackendUser): UserProfile {
  const role = ROLE_MAP[user.role] ?? 'user';
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`,
    role,
    isVIP: role !== 'user',
    permissions: user.permissions ?? [],
  };
}

export function redirectUrlFor(role: UserProfile['role']): string | undefined {
  const area = homeAreaOf(role);
  return area ? AREAS[area].path : undefined;
}

function persistSession(session: AuthSession): UserProfile {
  const profile = toUserProfile(session.user);
  storage.set(STORAGE_KEYS.AUTH_TOKEN, session.accessToken);
  storage.set(STORAGE_KEYS.REFRESH_TOKEN, session.refreshToken);
  storage.set(STORAGE_KEYS.USER_DATA, profile);
  return profile;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<UserProfile>> {
    const res = await apiClient.post<AuthSession>(API_ROUTES.AUTH.LOGIN, {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });

    if (!res.success) {
      return { ...res, data: null as unknown as UserProfile };
    }

    const profile = persistSession(res.data);
    if (credentials.rememberMe) {
      storage.set(STORAGE_KEYS.REMEMBERED_EMAIL, credentials.email);
    } else {
      storage.remove(STORAGE_KEYS.REMEMBERED_EMAIL);
    }

    return { ...res, data: profile };
  },

  /** Members sign up for themselves; creator/reviewer accounts are provisioned by an admin. */
  async register(credentials: RegisterCredentials): Promise<ApiResponse<UserProfile>> {
    const res = await apiClient.post<AuthSession>(API_ROUTES.AUTH.REGISTER, {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
      fullName: credentials.name.trim(),
      role: 'MEMBER',
    });

    if (!res.success) {
      return { ...res, data: null as unknown as UserProfile };
    }

    return { ...res, data: persistSession(res.data) };
  },

  async me(): Promise<ApiResponse<UserProfile>> {
    const res = await apiClient.get<BackendUser>(API_ROUTES.AUTH.PROFILE);
    if (!res.success) {
      return { ...res, data: null as unknown as UserProfile };
    }
    const profile = toUserProfile(res.data);
    storage.set(STORAGE_KEYS.USER_DATA, profile);
    return { ...res, data: profile };
  },

  logout(): void {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    storage.remove(STORAGE_KEYS.USER_DATA);
  },

  getStoredUser(): UserProfile | null {
    return storage.get<UserProfile | null>(STORAGE_KEYS.USER_DATA, null);
  },

  hasSession(): boolean {
    return Boolean(storage.getString(STORAGE_KEYS.AUTH_TOKEN));
  },
};
