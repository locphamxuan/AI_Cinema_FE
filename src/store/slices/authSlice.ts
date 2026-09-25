import type { StateCreator } from 'zustand';
import { mockSubscriptionVIP } from '@/mocks/mockData';
import { useWorkflowStore } from '../useWorkflowStore';
import { emptySubscription, type AppState, type AuthSlice, type UserProfile } from './types';
import { authService } from '@/services/authService';

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
      const res = await authService.login({
        email: trimmedEmail,
        password,
        rememberMe: true,
      });

      if (!res.success || !res.data?.user) {
        return {
          success: false,
          error: res.message || 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!',
        };
      }

      const loggedInUser: UserProfile = res.data.user;

      if (loggedInUser.role === 'creator') {
        useWorkflowStore.getState().setRole('creator');
      } else if (loggedInUser.role === 'reviewer') {
        useWorkflowStore.getState().setRole('reviewer');
      }

      const isVIP = Boolean(loggedInUser.isVIP || loggedInUser.role === 'creator' || loggedInUser.role === 'reviewer' || loggedInUser.role === 'vip');

      set({
        isAuthenticated: true,
        user: loggedInUser,
        isVIPMode: isVIP,
        isAuthModalOpen: false,
        subscription: isVIP ? mockSubscriptionVIP : emptySubscription,
        wallet: isVIP ? { mainCoin: 1500, bonusCoin: 500 } : { mainCoin: 60, bonusCoin: 20 },
      });

      return {
        success: true,
        redirectUrl: res.data.redirectUrl,
      };
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

    if (password.length < 8) {
      return { success: false, error: 'Mật khẩu phải có tối thiểu 8 ký tự theo quy định bảo mật!' };
    }

    try {
      const res = await authService.register({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });

      if (!res.success || !res.data?.user) {
        return {
          success: false,
          error: res.message || 'Đăng ký không thành công. Vui lòng thử lại!',
        };
      }

      const newUser: UserProfile = res.data.user;

      // Tặng 50 Coin thưởng chào mừng thành viên mới
      set({
        isAuthenticated: true,
        user: newUser,
        isVIPMode: false,
        isAuthModalOpen: false,
        subscription: emptySubscription,
        wallet: {
          mainCoin: 0,
          bonusCoin: 50, // Quà tặng đăng ký mới
        },
      });

      // Thêm giao dịch tặng coin chào mừng
      get().addTransaction({
        type: 'checkin',
        typeLabel: 'Quà tân thủ',
        description: 'Tặng 50 Coin Thưởng chào mừng thành viên mới AI Cinema',
        mainCoinDelta: 0,
        bonusCoinDelta: 50,
        totalAmount: 50,
        status: 'success',
        statusLabel: 'Thành công',
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
    authService.logout();
    set({
      isAuthenticated: false,
      user: null,
      isVIPMode: false,
      subscription: emptySubscription,
    });
  },
});
