import type { WebRole } from '@/lib/permissions';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: WebRole;
  isVIP: boolean;
  /** Permission keys the backend grants this account's role. */
  permissions?: string[];
  vipExpiresAt?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
  refreshToken?: string;
  redirectUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export type AuthRole = 'MEMBER' | 'CONTENT_CREATOR' | 'CONTENT_REVIEWER' | 'STAFF' | 'ADMIN';

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: AuthRole;
}
