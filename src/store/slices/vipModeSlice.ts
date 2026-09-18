import type { StateCreator } from 'zustand';
import { mockSubscriptionVIP } from '@/mocks/mockData';
import { emptySubscription, type AppState, type VipModeSlice } from './types';

export const createVipModeSlice: StateCreator<AppState, [], [], VipModeSlice> = (set) => ({
  isVIPMode: false,
  toggleVIPMode: () =>
    set((state) => {
      const newIsVIP = !state.isVIPMode;
      return {
        isVIPMode: newIsVIP,
        user: state.user ? { ...state.user, isVIP: newIsVIP } : null,
        subscription: newIsVIP ? mockSubscriptionVIP : emptySubscription,
      };
    }),
});
