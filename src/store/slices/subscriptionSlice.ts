import type { StateCreator } from 'zustand';
import { emptySubscription, type AppState, type SubscriptionSlice } from './types';
import type { SubscriptionPlan, UserSubscription } from '@/types/subscription';
import { storage, STORAGE_KEYS } from '@/lib/storage';

function getInitialSubscription(): UserSubscription {
  const saved = storage.get<UserSubscription | null>(STORAGE_KEYS.SUBSCRIPTION_DATA, null);
  if (saved && saved.plan) {
    return saved;
  }
  return emptySubscription;
}

export const createSubscriptionSlice: StateCreator<AppState, [], [], SubscriptionSlice> = (set, get) => ({
  subscription: getInitialSubscription(),

  activateSubscription: (plan: SubscriptionPlan, paymentMethod = 'Thẻ Visa ****4242') => {
    const now = new Date();
    const startDate = now.toISOString();
    const endDate = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000).toISOString();

    const newSub: UserSubscription = {
      plan,
      status: 'active',
      startDate,
      endDate,
      autoRenew: true,
      paymentMethod,
      cancelledBefore24h: false,
    };

    storage.set(STORAGE_KEYS.SUBSCRIPTION_DATA, newSub);

    // Mở quyền xem toàn bộ phim bằng việc kích hoạt VIP mode
    set({
      subscription: newSub,
      isVIPMode: true,
    });

    // Thêm giao dịch thanh toán vào lịch sử
    get().addTransaction({
      type: 'subscription',
      typeLabel: 'Đăng ký gói',
      description: `Kích hoạt thành công ${plan.name} (${plan.duration} ngày) - Bật tự động gia hạn`,
      mainCoinDelta: 0,
      bonusCoinDelta: 0,
      totalAmount: plan.price,
      status: 'success',
      statusLabel: 'Thành công',
    });

    return {
      success: true,
      message: `Đăng ký thành công ${plan.name}! Bạn đã được mở quyền xem toàn bộ phim không giới hạn.`,
    };
  },

  toggleAutoRenew: () => {
    const current = get().subscription;
    if (!current.plan) return;

    const updated: UserSubscription = {
      ...current,
      autoRenew: !current.autoRenew,
    };

    storage.set(STORAGE_KEYS.SUBSCRIPTION_DATA, updated);
    set({ subscription: updated });
  },

  cancelSubscription: () => {
    const current = get().subscription;
    if (!current.plan || !current.endDate) {
      return {
        success: false,
        message: 'Bạn chưa có gói hội viên đang hoạt động.',
        cancelledBefore24h: false,
      };
    }

    const end = new Date(current.endDate).getTime();
    const now = Date.now();
    const diffHours = (end - now) / (1000 * 60 * 60);
    const cancelledBefore24h = diffHours >= 24;

    const updated: UserSubscription = {
      ...current,
      autoRenew: false,
      status: 'active', // Vẫn giữ quyền xem đến hết ngày endDate (Dừng khi hết hạn)
      cancelledBefore24h,
    };

    storage.set(STORAGE_KEYS.SUBSCRIPTION_DATA, updated);
    set({ subscription: updated });

    const formattedDate = new Date(current.endDate).toLocaleDateString('vi-VN');
    const message = cancelledBefore24h
      ? `Đã hủy gia hạn tự động thành công (trước hạn ≥ 24h). Gói sẽ dừng khi hết hạn vào ngày ${formattedDate}. Bạn vẫn được xem toàn bộ phim đến thời điểm này.`
      : `Đã tắt tự động gia hạn trong mốc 24h trước ngày gia hạn. Gói sẽ kết thúc vào ngày ${formattedDate}.`;

    return {
      success: true,
      message,
      cancelledBefore24h,
    };
  },

  simulateExpiryTime: (hoursRemaining: number) => {
    const current = get().subscription;
    if (!current.plan) return;

    const newEnd = new Date(Date.now() + hoursRemaining * 60 * 60 * 1000).toISOString();
    const updated: UserSubscription = {
      ...current,
      endDate: newEnd,
      status: hoursRemaining <= 0 ? 'expired' : 'active',
    };

    storage.set(STORAGE_KEYS.SUBSCRIPTION_DATA, updated);
    set({
      subscription: updated,
      isVIPMode: hoursRemaining > 0,
    });
  },

  renewSubscription: () => {
    const current = get().subscription;
    if (!current.plan) {
      return { success: false, message: 'Chưa có gói hội viên để gia hạn.' };
    }

    const durationDays = current.plan.duration || 30;
    const currentEnd = current.endDate ? new Date(current.endDate).getTime() : Date.now();
    const baseTime = Math.max(Date.now(), currentEnd);
    const newEnd = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const updated: UserSubscription = {
      ...current,
      status: 'active',
      endDate: newEnd,
      autoRenew: true,
      cancelledBefore24h: false,
    };

    storage.set(STORAGE_KEYS.SUBSCRIPTION_DATA, updated);
    set({
      subscription: updated,
      isVIPMode: true,
    });

    get().addTransaction({
      type: 'subscription',
      typeLabel: 'Tự động gia hạn',
      description: `Tự động gia hạn thành công ${current.plan.name} (+${durationDays} ngày)`,
      mainCoinDelta: 0,
      bonusCoinDelta: 0,
      totalAmount: current.plan.price,
      status: 'success',
      statusLabel: 'Thành công',
    });

    return {
      success: true,
      message: `Đã tự động gia hạn thành công ${current.plan.name} thêm ${durationDays} ngày!`,
    };
  },
});
