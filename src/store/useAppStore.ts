'use client';

import { create } from 'zustand';
import { WalletState, CheckInStreak } from '@/types/wallet';
import { Movie } from '@/types/movie';
import { UserSubscription } from '@/types/subscription';
import { Transaction } from '@/types/transaction';
import { ChatMessage, ChatPhase, SupportTicket } from '@/types/chat';
import {
  mockWallet,
  mockCheckInStreak,
  mockSubscriptionVIP,
  mockMovie,
  mockTransactions,
  mockInitialMessages,
  botResponses,
} from '@/mocks/mockData';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  isVIP: boolean;
}

interface AppState {
  // User
  user: UserProfile;
  isVIPMode: boolean;
  toggleVIPMode: () => void;

  // Wallet
  wallet: WalletState;
  checkInStreak: CheckInStreak;
  claimDailyCheckIn: () => boolean; // returns success
  setWalletBalance: (main: number, bonus: number) => void;

  // Movie
  currentMovie: Movie;
  unlockEpisode: (episodeId: string) => { success: boolean; error?: string };

  // Subscription
  subscription: UserSubscription;
  toggleAutoRenew: () => void;
  cancelSubscription: () => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;

  // Chat
  chatMessages: ChatMessage[];
  chatPhase: ChatPhase;
  chatIsOpen: boolean;
  chatTicket: SupportTicket | null;
  estimatedWaitMinutes: number;
  toggleChat: () => void;
  sendMessage: (content: string) => void;
  handleQuickAction: (actionId: string) => void;
  escalateToAgent: () => void;

  // Check-in modal
  isCheckInModalOpen: boolean;
  setCheckInModalOpen: (open: boolean) => void;

  // Unlock modal
  isUnlockModalOpen: boolean;
  selectedEpisodeId: string | null;
  openUnlockModal: (episodeId: string) => void;
  closeUnlockModal: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // ===== USER =====
  user: {
    id: 'user-001',
    name: 'Phạm Xuân Lộc',
    email: 'loc.pham@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=loc',
    isVIP: true,
  },
  isVIPMode: true,
  toggleVIPMode: () =>
    set((state) => {
      const newIsVIP = !state.isVIPMode;
      return {
        isVIPMode: newIsVIP,
        user: { ...state.user, isVIP: newIsVIP },
        subscription: newIsVIP ? mockSubscriptionVIP : {
          plan: null,
          status: 'none' as const,
          startDate: null,
          endDate: null,
          autoRenew: false,
          paymentMethod: '',
        },
      };
    }),

  // ===== WALLET =====
  wallet: mockWallet,
  checkInStreak: mockCheckInStreak,

  claimDailyCheckIn: () => {
    const state = get();
    if (state.checkInStreak.todayClaimed) return false;

    const todayDay = state.checkInStreak.days.find((d) => d.isToday);
    if (!todayDay) return false;

    const reward = todayDay.reward;

    set((s) => ({
      wallet: {
        ...s.wallet,
        bonusCoin: s.wallet.bonusCoin + reward,
      },
      checkInStreak: {
        ...s.checkInStreak,
        todayClaimed: true,
        currentStreak: s.checkInStreak.currentStreak + 1,
        lastCheckInDate: new Date().toISOString().split('T')[0],
        days: s.checkInStreak.days.map((d) =>
          d.isToday ? { ...d, claimed: true } : d
        ),
      },
    }));

    // Also add a transaction
    get().addTransaction({
      type: 'checkin',
      typeLabel: 'Điểm danh',
      description: `Điểm danh nhận thưởng +${reward} Coin`,
      mainCoinDelta: 0,
      bonusCoinDelta: reward,
      totalAmount: reward,
      status: 'success',
      statusLabel: 'Thành công',
    });

    return true;
  },

  setWalletBalance: (main, bonus) =>
    set((s) => ({ wallet: { ...s.wallet, mainCoin: main, bonusCoin: bonus } })),

  // ===== MOVIE =====
  currentMovie: mockMovie,

  unlockEpisode: (episodeId: string) => {
    const state = get();
    const episode = state.currentMovie.episodes.find((ep) => ep.id === episodeId);
    if (!episode) return { success: false, error: 'Tập phim không tồn tại' };
    if (episode.isUnlocked || episode.isFree) return { success: true };

    const price = episode.price;
    const { mainCoin, bonusCoin } = state.wallet;
    const total = mainCoin + bonusCoin;

    if (total < price) {
      return { success: false, error: `Số dư không đủ. Cần ${price} Coin, hiện có ${total} Coin.` };
    }

    // Deduct main coin first, then bonus
    let mainDeduct = Math.min(mainCoin, price);
    let bonusDeduct = price - mainDeduct;

    set((s) => ({
      wallet: {
        mainCoin: s.wallet.mainCoin - mainDeduct,
        bonusCoin: s.wallet.bonusCoin - bonusDeduct,
      },
      currentMovie: {
        ...s.currentMovie,
        episodes: s.currentMovie.episodes.map((ep) =>
          ep.id === episodeId ? { ...ep, isUnlocked: true } : ep
        ),
      },
    }));

    get().addTransaction({
      type: 'episode_purchase',
      typeLabel: 'Mua tập phim',
      description: `Mở khóa "${state.currentMovie.title}" - Tập ${episode.episodeNumber}: ${episode.title}`,
      mainCoinDelta: -mainDeduct,
      bonusCoinDelta: -bonusDeduct,
      totalAmount: -price,
      status: 'success',
      statusLabel: 'Thành công',
      episodeInfo: `${state.currentMovie.title} - Tập ${episode.episodeNumber}`,
    });

    return { success: true };
  },

  // ===== SUBSCRIPTION =====
  subscription: mockSubscriptionVIP,

  toggleAutoRenew: () =>
    set((s) => ({
      subscription: {
        ...s.subscription,
        autoRenew: !s.subscription.autoRenew,
      },
    })),

  cancelSubscription: () =>
    set((s) => ({
      subscription: {
        ...s.subscription,
        autoRenew: false,
        status: 'cancelled' as const,
      },
    })),

  // ===== TRANSACTIONS =====
  transactions: mockTransactions,

  addTransaction: (tx) => {
    const id = `TXN-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const newTx: Transaction = {
      ...tx,
      id,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({
      transactions: [newTx, ...s.transactions],
    }));
  },

  // ===== CHAT =====
  chatMessages: mockInitialMessages,
  chatPhase: 'bot' as ChatPhase,
  chatIsOpen: false,
  chatTicket: null,
  estimatedWaitMinutes: 5,

  toggleChat: () => set((s) => ({ chatIsOpen: !s.chatIsOpen })),

  sendMessage: (content: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({ chatMessages: [...s.chatMessages, userMsg] }));

    // Simulate bot response after delay
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        content: botResponses['default'],
        timestamp: new Date().toISOString(),
      };
      set((s) => ({ chatMessages: [...s.chatMessages, botMsg] }));
    }, 1500);
  },

  handleQuickAction: (actionId: string) => {
    const actionLabels: Record<string, string> = {
      'coin-error': 'Tôi gặp lỗi trừ Coin',
      'cancel-renew': 'Tôi muốn hủy gia hạn tự động',
      'report': 'Tôi muốn báo cáo vi phạm',
    };

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: actionLabels[actionId] || actionId,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({ chatMessages: [...s.chatMessages, userMsg] }));

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        content: botResponses[actionId] || botResponses['default'],
        timestamp: new Date().toISOString(),
      };
      set((s) => ({ chatMessages: [...s.chatMessages, botMsg] }));
    }, 1500);
  },

  escalateToAgent: () => {
    const state = get();
    const ticket: SupportTicket = {
      id: `TK-${Date.now()}`,
      summary: state.chatMessages
        .filter((m) => m.sender === 'user')
        .map((m) => m.content)
        .join(' | '),
      userMessages: state.chatMessages.filter((m) => m.sender === 'user').map((m) => m.content),
      createdAt: new Date().toISOString(),
    };

    const systemMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'system',
      content: `📋 Đã tạo phiếu hỗ trợ #${ticket.id}. Đang chuyển tiếp đến Chuyên viên hỗ trợ...`,
      timestamp: new Date().toISOString(),
    };

    set({
      chatPhase: 'waiting',
      chatTicket: ticket,
      chatMessages: [...state.chatMessages, systemMsg],
      estimatedWaitMinutes: Math.floor(Math.random() * 5) + 3,
    });
  },

  // ===== MODALS =====
  isCheckInModalOpen: false,
  setCheckInModalOpen: (open) => set({ isCheckInModalOpen: open }),

  isUnlockModalOpen: false,
  selectedEpisodeId: null,
  openUnlockModal: (episodeId) => set({ isUnlockModalOpen: true, selectedEpisodeId: episodeId }),
  closeUnlockModal: () => set({ isUnlockModalOpen: false, selectedEpisodeId: null }),
}));
