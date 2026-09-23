import { WalletState, CheckInStreak } from '@/types/wallet';
import { Movie } from '@/types/movie';
import { UserSubscription } from '@/types/subscription';
import { Transaction } from '@/types/transaction';
import { ChatMessage, ChatPhase, SupportTicket } from '@/types/chat';

export const emptySubscription: UserSubscription = {
  plan: null,
  status: 'none',
  startDate: null,
  endDate: null,
  autoRenew: false,
  paymentMethod: '',
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role?: 'user' | 'vip' | 'admin' | 'creator' | 'reviewer';
  isVIP: boolean;
}

export interface AuthSlice {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => { success: boolean; error?: string; redirectUrl?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  initialAuthEmail: string;
  openAuthModal: (mode?: 'login' | 'register', email?: string) => void;
  closeAuthModal: () => void;
}

export interface ThemeSlice {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export interface VipModeSlice {
  isVIPMode: boolean;
  toggleVIPMode: () => void;
}

export interface WalletSlice {
  wallet: WalletState;
  checkInStreak: CheckInStreak;
  claimDailyCheckIn: () => boolean;
  syncCheckInStreak: () => void;
  setWalletBalance: (main: number, bonus: number) => void;
  isDepositModalOpen: boolean;
  openDepositModal: () => void;
  closeDepositModal: () => void;
  depositCoins: (amountVND: number, mainCoin: number, bonusCoin: number, method: string) => void;
}

export interface MovieSlice {
  currentMovie: Movie;
  unlockEpisode: (episodeId: string) => { success: boolean; error?: string };
  isUnlockModalOpen: boolean;
  selectedEpisodeId: string | null;
  openUnlockModal: (episodeId: string) => void;
  closeUnlockModal: () => void;
}

export interface SubscriptionSlice {
  subscription: UserSubscription;
  toggleAutoRenew: () => void;
  cancelSubscription: () => void;
}

export interface TransactionSlice {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export interface ChatSlice {
  chatMessages: ChatMessage[];
  chatPhase: ChatPhase;
  chatIsOpen: boolean;
  chatTicket: SupportTicket | null;
  estimatedWaitMinutes: number;
  toggleChat: () => void;
  sendMessage: (content: string) => void;
  handleQuickAction: (actionId: string) => void;
  escalateToAgent: () => void;
}

export interface UiModalsSlice {
  isRightSidebarOpen: boolean;
  openRightSidebar: () => void;
  closeRightSidebar: () => void;
  toggleRightSidebar: () => void;
  isCheckInModalOpen: boolean;
  setCheckInModalOpen: (open: boolean) => void;
}

export interface SearchFilterSlice {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}

export type AppState = AuthSlice &
  ThemeSlice &
  VipModeSlice &
  WalletSlice &
  MovieSlice &
  SubscriptionSlice &
  TransactionSlice &
  ChatSlice &
  UiModalsSlice &
  SearchFilterSlice;
