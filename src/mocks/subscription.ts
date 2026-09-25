import { UserSubscription, SubscriptionPlan } from '@/types/subscription';

// ====== SUBSCRIPTION PLANS (Tuần, Tháng, Năm theo Mainflow 2) ======
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'week_vip',
    name: 'Gói Tuần',
    price: 29000,
    duration: 7,
    billingCycle: 'week',
    features: [
      'Mở quyền xem toàn bộ phim',
      'Chất lượng Full HD 1080p',
      'Xem đồng thời 2 thiết bị',
      'Hủy gia hạn trước 24h tiện lợi',
    ],
  },
  {
    id: 'month_vip',
    name: 'Gói Tháng (Tiêu chuẩn)',
    price: 99000,
    duration: 30,
    billingCycle: 'month',
    popular: true,
    features: [
      'Mở quyền xem toàn bộ phim',
      'Chất lượng 4K Ultra HD đỉnh cao',
      'Xem trên 4 thiết bị đồng thời',
      'Tải phim xem offline không mạng',
      'Ưu tiên phim chiếu sớm 24h',
    ],
  },
  {
    id: 'year_vip',
    name: 'Gói Năm (VIP Tiết kiệm 25%)',
    price: 899000,
    duration: 365,
    billingCycle: 'year',
    features: [
      'Mở quyền xem toàn bộ phim',
      'Chất lượng 4K HDR & Dolby Atmos',
      'Không giới hạn thiết bị đăng nhập',
      'Coin thưởng tân thủ x2 mỗi tuần',
      'Hỗ trợ đặc quyền VIP 24/7',
    ],
  },
  // Giữ lại id cũ cho tương thích ngược
  {
    id: 'basic',
    name: 'Gói Cơ Bản (30 ngày)',
    price: 79000,
    duration: 30,
    billingCycle: 'month',
    features: ['Xem phim chất lượng HD', 'Xem trên 1 thiết bị', 'Có quảng cáo'],
  },
  {
    id: 'premium',
    name: 'Gói Premium (30 ngày)',
    price: 149000,
    duration: 30,
    billingCycle: 'month',
    features: ['Xem phim chất lượng 4K', 'Xem trên 4 thiết bị', 'Không quảng cáo', 'Tải phim offline'],
  },
  {
    id: 'vip',
    name: 'Gói VIP Đặc Biệt',
    price: 249000,
    duration: 30,
    billingCycle: 'month',
    features: ['Tất cả quyền lợi Premium', 'Xem sớm 24h', 'Coin thưởng x2', 'Hỗ trợ ưu tiên 24/7'],
  },
];

// User VIP - subscription expiring in ~20 hours (triggers 24h warning dynamically)
export const mockSubscriptionVIP: UserSubscription = {
  plan: subscriptionPlans[1], // Gói Tháng
  status: 'active',
  startDate: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(), // ~20 hours from now
  autoRenew: true,
  paymentMethod: 'Thẻ Visa ****4242',
  cancelledBefore24h: false,
};

export const mockSubscriptionNone: UserSubscription = {
  plan: null,
  status: 'none',
  startDate: null,
  endDate: null,
  autoRenew: false,
  paymentMethod: '',
  cancelledBefore24h: false,
};
