import type { StateCreator } from 'zustand';
import { episodeAccessService } from '@/services/episodeAccessService';
import { walletService } from '@/services/walletService';
import type { MySubscription } from '@/types/episodeAccess';
import type { AccountSlice, AppState } from './types';

/** A plan opens every episode only while ACTIVE and inside the period already paid for. */
export const planIsRunning = (plan: MySubscription | null, now = Date.now()) =>
  plan !== null && plan.status === 'ACTIVE' && new Date(plan.currentPeriodEnd).getTime() > now;

export const createAccountSlice: StateCreator<AppState, [], [], AccountSlice> = (set) => ({
  isVIPMode: false,

  /** Reads the wallet and the open plan from the BE; the client never decides either on its own. */
  syncAccount: async () => {
    const [wallet, plan] = await Promise.all([walletService.getBalance(), episodeAccessService.getMySubscription()]);
    set((s) => ({
      ...(wallet.success ? { wallet: wallet.data } : {}),
      isVIPMode: plan.success ? planIsRunning(plan.data) : s.isVIPMode,
    }));
  },
});
