import type { StateCreator } from 'zustand';
import { authService, redirectUrlFor } from '@/services/authService';
import type { AppState, AuthSlice, UserProfile } from './types';

/** Members and guests use the mobile app and studios their own Studio Web; this web is the back office only. */
const MEMBER_REFUSED = 'Tài khoản thành viên chỉ dùng được trên ứng dụng di động AI Cinema.';
const STUDIO_REFUSED = 'Tài khoản Studio đăng nhập tại Studio Web dành cho đối tác, không dùng trang quản trị nội bộ.';

/** Why this web refuses the account, or null when it is an internal role. */
export function refusalOf(role: UserProfile['role'] | undefined): string | null {
  if (role === 'user' || role === 'vip') return MEMBER_REFUSED;
  if (role === 'studio') return STUDIO_REFUSED;
  return null;
}

function sessionStateFor(user: UserProfile) {
  return { isAuthenticated: true, user };
}

export const createAuthSlice: StateCreator<AppState, [], [], AuthSlice> = (set) => ({
  isAuthenticated: false,
  user: null,

  restoreSession: () => {
    if (!authService.hasSession()) return;
    const user = authService.getStoredUser();
    if (!user) return;
    if (refusalOf(user.role)) {
      authService.logout();
      return;
    }

    set(sessionStateFor(user));
    // The Admin may have changed this role's permissions or the account's role since the last visit.
    void authService.me().then((res) => {
      if (!res.success || !res.data) return;
      if (refusalOf(res.data.role)) {
        authService.logout();
        set({ isAuthenticated: false, user: null });
        return;
      }
      set(sessionStateFor(res.data));
    });
  },

  login: async (email, password) => {
    const res = await authService.login({ email, password });
    if (!res.success || !res.data) {
      let errorMsg = res.message ?? 'Email hoặc mật khẩu không chính xác.';
      if (errorMsg === 'Incorrect email or password' || errorMsg.startsWith('HTTP error!')) {
        errorMsg = 'Email hoặc mật khẩu không chính xác.';
      }
      return { success: false, error: errorMsg };
    }

    const refused = refusalOf(res.data.role);
    if (refused) {
      authService.logout();
      return { success: false, error: refused };
    }

    set(sessionStateFor(res.data));

    return { success: true, redirectUrl: redirectUrlFor(res.data.role ?? 'user') };
  },

  logout: () => {
    authService.logout();
    set({ isAuthenticated: false, user: null });
  },
});
