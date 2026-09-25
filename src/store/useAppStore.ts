'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createAuthSlice } from './slices/authSlice';
import { createThemeSlice } from './slices/themeSlice';
import { createVipModeSlice } from './slices/vipModeSlice';
import { createWalletSlice } from './slices/walletSlice';
import { createMovieSlice } from './slices/movieSlice';
import { createSubscriptionSlice } from './slices/subscriptionSlice';
import { createTransactionSlice } from './slices/transactionSlice';
import { createChatSlice } from './slices/chatSlice';
import { createUiModalsSlice } from './slices/uiModalsSlice';
import { createSearchFilterSlice } from './slices/searchFilterSlice';
import type { AppState } from './slices/types';

export const useAppStore = create<AppState>()(
  persist(
    (set, get, api) => ({
      ...createAuthSlice(set, get, api),
      ...createThemeSlice(set, get, api),
      ...createVipModeSlice(set, get, api),
      ...createWalletSlice(set, get, api),
      ...createMovieSlice(set, get, api),
      ...createSubscriptionSlice(set, get, api),
      ...createTransactionSlice(set, get, api),
      ...createChatSlice(set, get, api),
      ...createUiModalsSlice(set, get, api),
      ...createSearchFilterSlice(set, get, api),
    }),
    {
      name: 'ai_cinema_app_store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      onRehydrateStorage: () => (state) => {
        if (state && typeof state.syncCheckInStreak === 'function') {
          state.syncCheckInStreak();
        }
      },
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        isVIPMode: state.isVIPMode,
        theme: state.theme,
        wallet: state.wallet,
        checkInStreak: state.checkInStreak,
        subscription: state.subscription,
        transactions: state.transactions,
      }),
    }
  )
);

export type { AppState } from './slices/types';
