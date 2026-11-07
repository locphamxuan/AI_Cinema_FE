import type { WebRole } from '@/lib/permissions';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role?: WebRole;
  isVIP: boolean;
  /** Permission keys the backend grants this account's role. */
  permissions?: string[];
}

export interface AuthSlice {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  logout: () => void;
  restoreSession: () => void;
}

export interface ThemeSlice {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export type AppState = AuthSlice & ThemeSlice;
