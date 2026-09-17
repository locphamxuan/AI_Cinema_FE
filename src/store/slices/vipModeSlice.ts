import type { StateCreator } from 'zustand';
import { mockSubscriptionVIP } from '@/mocks/mockData';
import type { AppState, VipModeSlice } from './types';

export const createVipModeSlice: StateCreator<AppState, [], [], VipModeSlice> = (set) => ({
  isVIPMode: true,
  toggleVIPMode: () =>
    set((state) => {
      const newIsVIP = !state.isVIPMode;
      return {
        isVIPMode: newIsVIP,
        user: state.user ? { ...state.user, isVIP: newIsVIP } : null,
        subscription: newIsVIP
          ? mockSubscriptionVIP
          : {
              plan: null,
              status: 'none' as const,
              startDate: null,
              endDate: null,
              autoRenew: false,
              paymentMethod: '',
            },
      };
    }),
});
