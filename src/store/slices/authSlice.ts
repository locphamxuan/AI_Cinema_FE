import type { StateCreator } from 'zustand';
import { authService } from '@/services/authService';
import { useWorkflowStore } from '../useWorkflowStore';
import { emptySubscription, type AppState, type AuthSlice, type UserProfile } from './types';

export const createAuthSlice: StateCreator<AppState, [], [], AuthSlice> = (set, get) => ({
  isAuthenticated: false,
  user: null,
  isAuthModalOpen: false,
  authModalMode: 'login',
  initialAuthEmail: '',

  openAuthModal: (mode = 'login', email = '') =>
    set({ isAuthModalOpen: true, authModalMode: mode, initialAuthEmail: email }),

  closeAuthModal: () => set({ isAuthModalOpen: false }),

  login: async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      return { success: false, error: 'Email và mật khẩu là bắt buộc.' };
    }

    try {
      const response = await authService.login({
        email: trimmedEmail,
        password,
        rememberMe: true,
      });

      if (!response.success || !response.data?.user) {
        return {
          success: false,
          error: response.message || 'Đăng nhập không thành công.',
        };
      }

      const { user, redirectUrl } = response.data;

      const normalizedUser: UserProfile = {
        ...user,
        role: user.role ?? 'user',
        isVIP: Boolean(user.isVIP),
      };

      if (normalizedUser.role === 'creator') {
        useWorkflowStore.getState().setRole('creator');
      } else if (normalizedUser.role === 'reviewer') {
        useWorkflowStore.getState().setRole('reviewer');
      }

      set({
        isAuthenticated: true,
        user: normalizedUser,
        isVIPMode: Boolean(normalizedUser.isVIP),
        isAuthModalOpen: false,
        subscription: emptySubscription,
        wallet: { mainCoin: 0, bonusCoin: 0 },
      });

      return { success: true, redirectUrl: redirectUrl || undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Đăng nhập không thành công.',
      };
    }
  },

  register: async (name, email, password, role = 'MEMBER') => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedEmail || !password || !trimmedName) {
      return { success: false, error: 'Vui lòng điền đầy đủ thông tin đăng ký!' };
    }

    try {
      const response = await authService.register({
        name: trimmedName,
        email: trimmedEmail,
        password,
        role,
      });

      if (!response.success || !response.data?.user) {
        return {
          success: false,
          error: response.message || 'Đăng ký thất bại.',
        };
      }

      const { user } = response.data;
      const normalizedUser: UserProfile = {
        ...user,
        role: user.role ?? 'user',
        isVIP: Boolean(user.isVIP),
      };

      set({
        isAuthenticated: true,
        user: normalizedUser,
        isVIPMode: false,
        isAuthModalOpen: false,
        subscription: emptySubscription,
        wallet: {
          mainCoin: 0,
          bonusCoin: 0,
        },
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Đăng ký không thành công.',
      };
    }
  },

  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      isVIPMode: false,
      subscription: emptySubscription,
    });
  },
});
