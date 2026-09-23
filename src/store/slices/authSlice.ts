import type { StateCreator } from 'zustand';
import { mockSubscriptionVIP } from '@/mocks/mockData';
import { authService, redirectUrlFor } from '@/services/authService';
import { useWorkflowStore } from '../useWorkflowStore';
import { emptySubscription, type AppState, type AuthSlice, type UserProfile } from './types';

// Wallet and subscription still come from mocks: the backend has no wallet/subscription
// API yet (MF-2/MF-3). Only identity is real.
function sessionStateFor(user: UserProfile) {
  const isStaffSide = user.role === 'creator' || user.role === 'reviewer' || user.role === 'admin';
  return {
    isAuthenticated: true,
    user,
    isVIPMode: isStaffSide,
    isAuthModalOpen: false,
    subscription: isStaffSide ? mockSubscriptionVIP : emptySubscription,
  };
}

function syncWorkflowRole(user: UserProfile) {
  if (user.role === 'creator' || user.role === 'reviewer') {
    useWorkflowStore.getState().setRole(user.role);
  }
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

    syncWorkflowRole(user);
    set(sessionStateFor(user));
  },

  login: async (email, password) => {
    const res = await authService.login({ email, password });
    if (!res.success || !res.data) {
      return { success: false, error: res.message ?? 'Email hoặc mật khẩu không chính xác.' };
    }

    syncWorkflowRole(res.data);
    set(sessionStateFor(res.data));

    return { success: true, redirectUrl: redirectUrlFor(res.data.role ?? 'user') };
  },

  register: async (name, email, password) => {
    if (!name.trim() || !email.trim() || !password) {
      return { success: false, error: 'Vui lòng điền đầy đủ thông tin đăng ký!' };
    }

    const res = await authService.register({ name, email, password });
    if (!res.success || !res.data) {
      return { success: false, error: res.message ?? 'Đăng ký không thành công.' };
    }

    set(sessionStateFor(res.data));

    return { success: true };
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
