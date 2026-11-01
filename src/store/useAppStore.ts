'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createAuthSlice } from './slices/authSlice';
import { createThemeSlice } from './slices/themeSlice';
import { createAccountSlice } from './slices/accountSlice';
import { createWalletSlice } from './slices/walletSlice';
import { createMovieSlice } from './slices/movieSlice';
import { createUiModalsSlice } from './slices/uiModalsSlice';
import { createSearchFilterSlice } from './slices/searchFilterSlice';
import type { AppState } from './slices/types';

export const useAppStore = create<AppState>()(
  persist(
    (set, get, api) => ({
      ...createAuthSlice(set, get, api),
      ...createThemeSlice(set, get, api),
      ...createAccountSlice(set, get, api),
      ...createWalletSlice(set, get, api),
      ...createMovieSlice(set, get, api),
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
      }),
    }
  )
);

export type { AppState } from './slices/types';
