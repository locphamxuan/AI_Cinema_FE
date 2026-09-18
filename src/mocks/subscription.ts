import { UserSubscription, SubscriptionPlan } from '@/types/subscription';

// ====== SUBSCRIPTION PLANS ======
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Gói Cơ Bản',
    price: 79000,
    duration: 30,
    features: ['Xem phim chất lượng HD', 'Xem trên 1 thiết bị', 'Có quảng cáo'],
  },
  {
    id: 'premium',
    name: 'Gói Premium',
    price: 149000,
    duration: 30,
    features: ['Xem phim chất lượng 4K', 'Xem trên 4 thiết bị', 'Không quảng cáo', 'Tải phim offline', 'Ưu tiên nội dung mới'],
    popular: true,
  },
  {
    id: 'vip',
    name: 'Gói VIP',
    price: 249000,
    duration: 30,
    features: ['Tất cả quyền lợi Premium', 'Xem sớm 24h', 'Coin thưởng x2', 'Hỗ trợ ưu tiên 24/7', 'Không giới hạn thiết bị'],
  },
];

// User VIP - subscription expiring in ~20 hours (triggers 24h warning)
export const mockSubscriptionVIP: UserSubscription = {
  plan: subscriptionPlans[2], // VIP
  status: 'active',
  startDate: '2026-08-07T10:00:00+07:00',
  endDate: '2026-09-07T07:00:00+07:00', // ~20 hours from now (current: Sep 6, 11:30)
  autoRenew: true,
  paymentMethod: 'Thẻ Visa ****4242',
};

export const mockSubscriptionNone: UserSubscription = {
  plan: null,
  status: 'none',
  startDate: null,
  endDate: null,
  autoRenew: false,
  paymentMethod: '',
};
