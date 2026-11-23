'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createAuthSlice } from './slices/authSlice';
import { createThemeSlice } from './slices/themeSlice';
import type { AppState } from './slices/types';

export const useAppStore = create<AppState>()(
  persist(
    (set, get, api) => ({
      ...createAuthSlice(set, get, api),
      ...createThemeSlice(set, get, api),
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
      // Only the theme is shared by all tabs. The signed-in account belongs to each tab (lib/authSession):
      // a profile kept here would make one window believe it is the account another window just signed in.
      partialize: (state) => ({ theme: state.theme }),
      merge: (persisted, current) => ({ ...current, theme: (persisted as Partial<AppState> | undefined)?.theme ?? current.theme }),
    }
  )
);

export type { AppState } from './slices/types';
