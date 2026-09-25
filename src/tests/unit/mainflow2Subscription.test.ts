import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/store/useAppStore';
import { subscriptionPlans } from '@/mocks/subscription';

describe('Mainflow 2: Đăng ký gói thành viên & tự động gia hạn', () => {
  beforeEach(() => {
    localStorage.clear();
    const store = useAppStore.getState();
    store.logout();
  });

  it('Bước 1: Cung cấp đầy đủ các gói theo chu kỳ Tuần, Tháng, Năm', () => {
    const weekPlan = subscriptionPlans.find((p) => p.billingCycle === 'week');
    const monthPlan = subscriptionPlans.find((p) => p.billingCycle === 'month');
    const yearPlan = subscriptionPlans.find((p) => p.billingCycle === 'year');

    expect(weekPlan).toBeDefined();
    expect(weekPlan?.duration).toBe(7);

    expect(monthPlan).toBeDefined();
    expect(monthPlan?.duration).toBe(30);

    expect(yearPlan).toBeDefined();
    expect(yearPlan?.duration).toBe(365);
  });

  it('Bước 2 & 3: Thanh toán, kích hoạt gói và mở quyền xem toàn bộ phim', () => {
    const store = useAppStore.getState();
    const monthPlan = subscriptionPlans.find((p) => p.id === 'month_vip')!;

    // Trước khi kích hoạt
    expect(store.subscription.status).toBe('none');
    expect(store.isVIPMode).toBe(false);

    // Kích hoạt gói
    const result = store.activateSubscription(monthPlan, 'Thẻ Visa ****4242');

    expect(result.success).toBe(true);
    const updated = useAppStore.getState();
    expect(updated.subscription.status).toBe('active');
    expect(updated.subscription.plan?.id).toBe('month_vip');
    expect(updated.subscription.autoRenew).toBe(true);
    expect(updated.isVIPMode).toBe(true); // Mở quyền xem toàn bộ phim

    // Đã ghi nhận lịch sử giao dịch
    const lastTx = updated.transactions[0];
    expect(lastTx).toBeDefined();
    expect(lastTx.type).toBe('subscription');
    expect(lastTx.totalAmount).toBe(monthPlan.price);
  });

  it('Bước 4 Nhánh Có: Hủy gia hạn trước hạn >= 24h -> Chuyển sang Dừng khi hết hạn', () => {
    const store = useAppStore.getState();
    const monthPlan = subscriptionPlans.find((p) => p.id === 'month_vip')!;
    store.activateSubscription(monthPlan);

    // Giả lập còn 72 giờ (3 ngày) trước hạn (>= 24h)
    store.simulateExpiryTime(72);

    const cancelResult = store.cancelSubscription();

    expect(cancelResult.success).toBe(true);
    expect(cancelResult.cancelledBefore24h).toBe(true);

    const state = useAppStore.getState();
    // Tắt tự động gia hạn
    expect(state.subscription.autoRenew).toBe(false);
    // Vẫn duy trì active để xem toàn bộ phim cho tới ngày hết hạn (Dừng khi hết hạn)
    expect(state.subscription.status).toBe('active');
    expect(state.isVIPMode).toBe(true);
    expect(cancelResult.message).toContain('trước hạn ≥ 24h');
  });

  it('Bước 4 Nhánh Không: Trong mốc < 24h và Tự động gia hạn tiếp tục gói', () => {
    const store = useAppStore.getState();
    const monthPlan = subscriptionPlans.find((p) => p.id === 'month_vip')!;
    store.activateSubscription(monthPlan);

    // Giả lập còn 20 giờ (< 24h)
    store.simulateExpiryTime(20);

    const stateBefore = useAppStore.getState();
    const diffHours = (new Date(stateBefore.subscription.endDate!).getTime() - Date.now()) / (1000 * 3600);
    expect(diffHours).toBeLessThanOrEqual(24);
    expect(diffHours).toBeGreaterThan(0);
    expect(stateBefore.subscription.autoRenew).toBe(true);

    // Tự động thu phí & gia hạn sang chu kỳ mới
    const renewResult = store.renewSubscription();
    expect(renewResult.success).toBe(true);

    const stateAfter = useAppStore.getState();
    expect(stateAfter.subscription.status).toBe('active');
    expect(stateAfter.subscription.autoRenew).toBe(true);
    // Thời hạn được kéo dài thêm 30 ngày
    const newDiffDays = (new Date(stateAfter.subscription.endDate!).getTime() - Date.now()) / (1000 * 3600 * 24);
    expect(newDiffDays).toBeGreaterThan(25);
  });
});
