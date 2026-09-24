import type { StateCreator } from 'zustand';
import { useWorkflowStore } from '../useWorkflowStore';
import { emptySubscription, type AppState, type AuthSlice, type UserProfile } from './types';

export const createAuthSlice: StateCreator<AppState, [], [], AuthSlice> = (set, get) => ({
  isAuthenticated: false, // Bắt đầu ở trạng thái chưa đăng nhập để thấy landing page Netflix style
  user: null,
  isAuthModalOpen: false,
  authModalMode: 'login',
  initialAuthEmail: '',

  openAuthModal: (mode = 'login', email = '') =>
    set({ isAuthModalOpen: true, authModalMode: mode, initialAuthEmail: email }),

  closeAuthModal: () => set({ isAuthModalOpen: false }),

  login: (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Creator (Maker) Account: creator@gmail.com / 1
    if (trimmedEmail === 'creator@gmail.com' && password === '1') {
      const creatorUser: UserProfile = {
        id: 'usr-creator-01',
        name: 'Đạo diễn Trần Minh Huy (Maker)',
        email: 'creator@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'creator',
        isVIP: true,
      };

      useWorkflowStore.getState().setRole('creator');

      set({
        isAuthenticated: true,
        user: creatorUser,
        isVIPMode: true,
        isAuthModalOpen: false,
        subscription: emptySubscription,
        wallet: { mainCoin: 0, bonusCoin: 0 },
      });

      return { success: true, redirectUrl: '/creator/projects' };
    }

    // 2. Reviewer (Checker) Account: reviewer@gmail.com / 1
    if (trimmedEmail === 'reviewer@gmail.com' && password === '1') {
      const reviewerUser: UserProfile = {
        id: 'usr-reviewer-01',
        name: 'Thẩm định viên Lê Quốc Bảo (Checker)',
        email: 'reviewer@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'reviewer',
        isVIP: true,
      };

      useWorkflowStore.getState().setRole('reviewer');

      set({
        isAuthenticated: true,
        user: reviewerUser,
        isVIPMode: true,
        isAuthModalOpen: false,
        subscription: emptySubscription,
        wallet: { mainCoin: 0, bonusCoin: 0 },
      });

      return { success: true, redirectUrl: '/reviewer' };
    }

    // 3. Demo Normal User: userdemo@gmail.com / 1
    if (trimmedEmail === 'userdemo@gmail.com' && password === '1') {
      const demoUser: UserProfile = {
        id: 'user-demo-001',
        name: 'Phạm Xuân Lộc (Khán Giả)',
        email: 'userdemo@gmail.com',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=locdemo',
        role: 'user',
        isVIP: false,
      };

      set({
        isAuthenticated: true,
        user: demoUser,
        isVIPMode: false,
        isAuthModalOpen: false,
        subscription: emptySubscription,
        wallet: { mainCoin: 60, bonusCoin: 20 },
      });

      return { success: true };
    }

    // 4. Demo VIP User: vipdemo@gmail.com / 1
    if (trimmedEmail === 'vipdemo@gmail.com' && password === '1') {
      const vipUser: UserProfile = {
        id: 'user-vip-001',
        name: 'Phạm Xuân Lộc (Khán Giả VIP)',
        email: 'vipdemo@gmail.com',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=locvip',
        role: 'vip',
        isVIP: true,
      };

      set({
        isAuthenticated: true,
        user: vipUser,
        isVIPMode: true,
        isAuthModalOpen: false,
        subscription: emptySubscription,
        wallet: { mainCoin: 0, bonusCoin: 0 },
      });

      return { success: true };
    }

    // 5. Cho phép đăng nhập với email bất kỳ khác nếu hợp lệ
    if (trimmedEmail && password) {
      const customUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: trimmedEmail.split('@')[0] || 'Khán giả AI',
        email: trimmedEmail,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${trimmedEmail}`,
        role: 'user',
        isVIP: false,
      };

      set({
        isAuthenticated: true,
        user: customUser,
        isVIPMode: false,
        isAuthModalOpen: false,
        subscription: emptySubscription,
        wallet: { mainCoin: 50, bonusCoin: 20 },
      });

      return { success: true };
    }

    return { success: false, error: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!' };
  },

  register: (name, email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedEmail || !password || !trimmedName) {
      return { success: false, error: 'Vui lòng điền đầy đủ thông tin đăng ký!' };
    }

    const newUser: UserProfile = {
      id: `user-reg-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trimmedName)}`,
      isVIP: false,
    };

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
