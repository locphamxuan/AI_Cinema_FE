import type { StateCreator } from 'zustand';
import { emptySubscription, type AppState, type SubscriptionSlice } from './types';

export const createSubscriptionSlice: StateCreator<AppState, [], [], SubscriptionSlice> = (set) => ({
  subscription: emptySubscription,

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
