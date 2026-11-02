import type { StateCreator } from 'zustand';
import { authService, redirectUrlFor } from '@/services/authService';
import type { AppState, AuthSlice, UserProfile } from './types';

/** Members and guests use the mobile app; the web is the back office only. */
const MEMBER_REFUSED = 'Tài khoản thành viên chỉ dùng được trên ứng dụng di động AI Cinema.';

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
    if (user.role === 'user') {
      authService.logout();
      return;
    }

    set(sessionStateFor(user));
    // The Admin may have changed this role's permissions or the account's role since the last visit.
    void authService.me().then((res) => {
      if (!res.success || !res.data) return;
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

    if (res.data.role === 'user') {
      authService.logout();
      return { success: false, error: MEMBER_REFUSED };
    }

    set(sessionStateFor(res.data));

    return { success: true, redirectUrl: redirectUrlFor(res.data.role ?? 'user') };
  },

  logout: () => {
    authService.logout();
    set({ isAuthenticated: false, user: null });
  },
});
