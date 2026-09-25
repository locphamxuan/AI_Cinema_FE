'use client';

import { useAppStore } from '@/store/useAppStore';
import { useState, useEffect, useMemo } from 'react';
import DeviceManager from './DeviceManager';
import PlanCatalog from './PlanCatalog';

export default function SubscriptionManager() {
  const { subscription, toggleAutoRenew } = useAppStore();

  // Calculate hours until renewal
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const hoursUntilRenewal = useMemo(() => {
    if (!subscription.endDate) return null;
    const end = new Date(subscription.endDate).getTime();
    const diffMs = end - now;
    if (diffMs <= 0) return 0;
    return Math.round(diffMs / (1000 * 60 * 60) * 10) / 10; // 1 decimal
  }, [subscription.endDate, now]);

  const showRenewalWarning = hoursUntilRenewal !== null && hoursUntilRenewal <= 24 && hoursUntilRenewal > 0 && subscription.autoRenew;

  // Countdown timer
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    if (!subscription.endDate || !subscription.autoRenew) return;

    const update = () => {
      const end = new Date(subscription.endDate!).getTime();
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) {
        setCountdown('Đã hết hạn');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [subscription.endDate, subscription.autoRenew]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">🎬 Quản Lý Gói Hội Viên</h1>
        <p className="text-muted-light text-sm mt-1">Quản lý gói dịch vụ, thanh toán và gia hạn tự động</p>
      </div>

      {/* 24h Renewal Warning Banner */}
      {showRenewalWarning && (
        <div className="glass-card p-5 border-2 border-coin/50 glow-coin animate-slide-down">
          <div className="flex items-start gap-3">
            <span className="text-3xl">⚠️</span>
            <div className="flex-1">
              <h3 className="text-base font-bold text-coin">Cảnh báo gia hạn tự động</h3>
              <p className="text-sm text-foreground/80 mt-1">
                Gói của bạn sẽ tự động gia hạn sau <span className="font-bold text-coin">{countdown}</span> nữa.
                Hệ thống sẽ trừ phí tự động <span className="font-bold text-foreground">{subscription.plan?.price.toLocaleString('vi-VN')}₫</span>.
                Bạn có thể tắt tự động gia hạn trước mốc thời gian này.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={() => { toggleAutoRenew(); }}
                  className="px-4 py-2 rounded-xl bg-danger/20 text-danger font-medium text-sm hover:bg-danger/30 transition-colors"
                >
                  ❌ Hủy gia hạn tự động
                </button>
                <button
                  className="px-4 py-2 rounded-xl bg-white/10 text-foreground font-medium text-sm hover:bg-white/15 transition-colors"
                >
                  💳 Đổi phương thức thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Plan Card */}
      {subscription.plan ? (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coin to-coin-dark flex items-center justify-center text-2xl">
                👑
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{subscription.plan.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  subscription.status === 'active'
                    ? 'bg-verified/20 text-verified'
                    : subscription.status === 'cancelled'
                      ? 'bg-danger/20 text-danger'
                      : 'bg-warning/20 text-warning'
                }`}>
                  {subscription.status === 'active' ? '✅ Đang hoạt động'
                    : subscription.status === 'cancelled' ? '❌ Đã hủy'
                      : '⏳ Hết hạn'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold gradient-text-coin">{subscription.plan.price.toLocaleString('vi-VN')}₫</p>
              <p className="text-xs text-muted-light">/{subscription.plan.duration} ngày</p>
            </div>
          </div>

          {/* Plan Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <p className="text-[10px] text-slate-500 dark:text-muted-light uppercase font-bold">Ngày bắt đầu</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                {subscription.startDate
                  ? new Date(subscription.startDate).toLocaleDateString('vi-VN')
                  : '—'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <p className="text-[10px] text-slate-500 dark:text-muted-light uppercase font-bold">Ngày hết hạn</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                {subscription.endDate
                  ? new Date(subscription.endDate).toLocaleDateString('vi-VN')
                  : '—'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <p className="text-[10px] text-slate-500 dark:text-muted-light uppercase font-bold">Thanh toán qua</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-foreground">{subscription.paymentMethod || '—'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <p className="text-[10px] text-slate-500 dark:text-muted-light uppercase font-bold">Thời gian còn lại</p>
              <p className="text-sm font-bold text-coin">{countdown || '—'}</p>
            </div>
          </div>

          {/* Features */}
          <div className="mb-5">
            <p className="text-xs text-slate-500 dark:text-muted-light uppercase tracking-wider font-bold mb-2">Quyền lợi gói</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {subscription.plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-foreground/80">
                  <span className="text-verified font-bold">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Auto-Renew Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-foreground">Tự động gia hạn (Auto-renewal)</p>
              <p className="text-xs text-slate-500 dark:text-muted-light mt-0.5">
                {subscription.autoRenew
                  ? 'Gói sẽ tự động gia hạn khi hết hạn'
                  : 'Gói sẽ hết hạn và không gia hạn'}
              </p>
            </div>
            <button
              onClick={toggleAutoRenew}
              className={`toggle-switch ${subscription.autoRenew ? 'active' : 'inactive'}`}
              aria-label="Toggle auto-renewal"
            />
          </div>
        </div>
      ) : (
        /* No Plan */
        <div className="glass-card p-8 text-center">
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-foreground">Bạn chưa có gói hội viên</h2>
          <p className="text-slate-500 dark:text-muted-light text-sm mt-2">Đăng ký gói để xem phim không giới hạn và hưởng nhiều ưu đãi hấp dẫn</p>
        </div>
      )}

      <PlanCatalog />

      <DeviceManager />
    </div>
  );
}
