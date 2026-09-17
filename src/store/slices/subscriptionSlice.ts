import type { StateCreator } from 'zustand';
import { mockSubscriptionVIP } from '@/mocks/mockData';
import type { AppState, SubscriptionSlice } from './types';

export const createSubscriptionSlice: StateCreator<AppState, [], [], SubscriptionSlice> = (set) => ({
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
});
