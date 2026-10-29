import type { StateCreator } from 'zustand';
import { authService, redirectUrlFor } from '@/services/authService';
import { APPLICATION_MESSAGES } from '@/lib/applicationMessages';
import type { AppState, AuthSlice, UserProfile } from './types';

// The wallet and the plan are read from the BE right after (syncAccount), never assumed here.
function sessionStateFor(user: UserProfile) {
  return { isAuthenticated: true, user, isVIPMode: false, isAuthModalOpen: false };
}

export const createAuthSlice: StateCreator<AppState, [], [], AuthSlice> = (set) => ({
  isAuthenticated: false,
  user: null,
  isAuthModalOpen: false,
  authModalMode: 'login',
  initialAuthEmail: '',

  openAuthModal: (mode = 'login', email = '') =>
    set({ isAuthModalOpen: true, authModalMode: mode, initialAuthEmail: email }),

  closeAuthModal: () => set({ isAuthModalOpen: false }),

  restoreSession: () => {
    if (!authService.hasSession()) return;
    const user = authService.getStoredUser();
    if (!user) return;

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

    set(sessionStateFor(res.data));

    return { success: true, redirectUrl: redirectUrlFor(res.data.role ?? 'user') };
  },

  register: async (name, email, password, dateOfBirth) => {
    if (!name.trim() || !email.trim() || !password || !dateOfBirth) {
      return { success: false, error: APPLICATION_MESSAGES.MSG02.message };
    }

    const res = await authService.register({ name, email, password, dateOfBirth });
    if (!res.success || !res.data) {
      return { success: false, error: res.message ?? 'Đăng ký không thành công.' };
    }

    set(sessionStateFor(res.data));

    return { success: true };
  },

  loginWithGoogle: async (idToken) => {
    const res = await authService.googleLogin({ idToken });
    if (!res.success || !res.data) {
      return { success: false, error: res.message ?? 'Đăng nhập bằng Google thất bại.' };
    }

    set(sessionStateFor(res.data));

    return { success: true, redirectUrl: redirectUrlFor(res.data.role ?? 'user') };
  },

  logout: () => {
    authService.logout();
    set({
      isAuthenticated: false,
      user: null,
      isVIPMode: false,
      wallet: { mainCoin: 0, bonusCoin: 0 },
      checkInStreak: { currentStreak: 0, lastCheckInDate: null, todayClaimed: false },
      availableSpins: 0,
    });
  },
});
