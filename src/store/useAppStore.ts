'use client';

import { create } from 'zustand';
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

export const useAppStore = create<AppState>((set, get, api) => ({
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
}));

export type { AppState } from './slices/types';
