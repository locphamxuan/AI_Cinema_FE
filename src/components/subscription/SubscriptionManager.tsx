'use client';

import { useAppStore } from '@/store/useAppStore';
import { useProductionStore } from '@/store/useProductionStore';
import { useState, useEffect, useMemo } from 'react';
import { subscriptionPlans } from '@/mocks/subscription';
import type { SubscriptionPlan } from '@/types/subscription';
import { CheckCircle2, AlertTriangle, ShieldCheck, Zap, RefreshCw, XCircle, CreditCard, Sparkles } from 'lucide-react';

export default function SubscriptionManager() {
  const {
    subscription,
    toggleAutoRenew,
    cancelSubscription,
    activateSubscription,
    simulateExpiryTime,
    renewSubscription,
    isVIPMode,
  } = useAppStore();

  const { devices, revokeDevice, revokeAllOtherDevices } = useProductionStore();

  // Selected billing cycle filter
  const [selectedCycle, setSelectedCycle] = useState<'all' | 'week' | 'month' | 'year'>('all');

  // Payment confirmation modal state
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Thẻ Visa / Mastercard (****4242)');
  const [notification, setNotification] = useState<{ type: 'success' | 'warning' | 'info'; text: string } | null>(null);

  // Calculate hours until renewal
  const hoursUntilRenewal = useMemo(() => {
    if (!subscription.endDate) return null;
    const end = new Date(subscription.endDate).getTime();
    const now = Date.now();
    const diffMs = end - now;
    if (diffMs <= 0) return 0;
    return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10; // 1 decimal
  }, [subscription.endDate]);

  // Mainflow 2 logic: is inside 24h window?
  const isExpiringWithin24h = hoursUntilRenewal !== null && hoursUntilRenewal <= 24 && hoursUntilRenewal > 0;
  const showRenewalWarning = isExpiringWithin24h && subscription.autoRenew;

  // Countdown timer string (hours, minutes, seconds)
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    if (!subscription.endDate) return;

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
  }, [subscription.endDate]);

  // Auto clear notification after 6 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 6000);
    return () => clearTimeout(timer);
  }, [notification]);

  const handleCancelClick = () => {
    const res = cancelSubscription();
    setNotification({
      type: res.cancelledBefore24h ? 'success' : 'warning',
      text: res.message,
    });
  };

  const handleConfirmPayment = () => {
    if (!selectedPlanForPayment) return;
    const res = activateSubscription(selectedPlanForPayment, selectedPaymentMethod);
    setSelectedPlanForPayment(null);
    setNotification({
      type: 'success',
      text: res.message || 'Đăng ký gói thành công!',
    });
  };

  const filteredPlans = useMemo(() => {
    if (selectedCycle === 'all') return subscriptionPlans.slice(0, 3);
    return subscriptionPlans.filter((p) => p.billingCycle === selectedCycle);
  }, [selectedCycle]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header with Mainflow 2 Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-foreground tracking-tight">
              🎬 Đăng Ký Gói Thành Viên & Tự Động Gia Hạn
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
              Mainflow 2
            </span>
          </div>
          <p className="text-slate-500 dark:text-muted-light text-xs sm:text-sm mt-1">
            Mở quyền xem toàn bộ phim không giới hạn • Theo dõi mốc 24h gia hạn tự động
          </p>
        </div>

        {/* Live Status Badge */}
        {subscription.plan && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {subscription.autoRenew ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Tự động gia hạn: BẬT
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Dừng khi hết hạn
              </span>
            )}
          </div>
        )}
      </div>

      {/* Floating Alert Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-start gap-3 animate-slide-down ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : notification.type === 'warning'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
          )}
          <div className="flex-1 font-medium">{notification.text}</div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs opacity-60 hover:opacity-100 cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 24h Renewal Warning Banner (Mainflow 2 core feature) */}
      {showRenewalWarning && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 border-2 border-amber-500/40 shadow-lg shadow-amber-500/10 animate-slide-down">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-amber-600 dark:text-amber-400">
                  Cảnh báo mốc 24h: Chuẩn bị thu phí tự động gia hạn
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500 text-black">
                  Mốc &lt; 24h
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                Gói <strong className="text-slate-900 dark:text-white">{subscription.plan?.name}</strong> của bạn sẽ tự động gia hạn sau{' '}
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm px-1.5 py-0.5 rounded bg-amber-500/10">
                  {countdown}
                </span>.
                Hệ thống sẽ tự động trừ phí chu kỳ tiếp theo:{' '}
                <strong className="text-purple-600 dark:text-purple-400">{subscription.plan?.price.toLocaleString('vi-VN')}₫</strong>.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Hủy gia hạn tự động</span>
                </button>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  (Nếu hủy, bạn vẫn giữ quyền xem đến khi hết hạn gói)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mainflow 2 Interactive Flow Chart Tracker */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#161922] border border-slate-200 dark:border-white/10 shadow-sm">
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          Tiến trình nghiệp vụ Mainflow 2
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div
            className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              subscription.plan
                ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 font-bold'
                : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-500'
            }`}
          >
            <span>1️⃣ Chọn gói</span>
            {subscription.plan && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-purple-600" />}
          </div>
          <div
            className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              subscription.status === 'active'
                ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 font-bold'
                : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-500'
            }`}
          >
            <span>2️⃣ Thanh toán & Kích hoạt</span>
            {subscription.status === 'active' && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-purple-600" />}
          </div>
          <div
            className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              isVIPMode
                ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 font-bold'
                : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-500'
            }`}
          >
            <span>3️⃣ Mở full phim</span>
            {isVIPMode && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-purple-600" />}
          </div>
          <div
            className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              subscription.plan
                ? subscription.autoRenew
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold'
                : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-500'
            }`}
          >
            <span>
              {subscription.autoRenew ? '4️⃣ Tự động gia hạn' : '4️⃣ Dừng khi hết hạn'}
            </span>
          </div>
        </div>
      </div>

      {/* Current Active Plan Card */}
      {subscription.plan ? (
        <div className="bg-white dark:bg-[#161922] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-purple-600/30 shrink-0">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-foreground">
                    {subscription.plan.name}
                  </h2>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      subscription.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {subscription.status === 'active' ? 'Đang hoạt động' : 'Hết hạn'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-muted-light mt-0.5">
                  Đã mở khóa toàn bộ quyền xem phim OTT AI và quản lý đa thiết bị
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {subscription.plan.price.toLocaleString('vi-VN')}₫
              </p>
              <p className="text-xs text-slate-500 dark:text-muted-light">
                Chu kỳ: {subscription.plan.duration} ngày
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <p className="text-[10px] text-slate-500 dark:text-muted-light uppercase font-bold tracking-wider">
                Ngày bắt đầu
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-foreground mt-0.5">
                {subscription.startDate
                  ? new Date(subscription.startDate).toLocaleDateString('vi-VN')
                  : '—'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <p className="text-[10px] text-slate-500 dark:text-muted-light uppercase font-bold tracking-wider">
                Ngày hết hạn
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-foreground mt-0.5">
                {subscription.endDate
                  ? new Date(subscription.endDate).toLocaleDateString('vi-VN')
                  : '—'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <p className="text-[10px] text-slate-500 dark:text-muted-light uppercase font-bold tracking-wider">
                Phương thức
              </p>
              <p className="text-xs font-semibold text-slate-900 dark:text-foreground mt-0.5 truncate">
                {subscription.paymentMethod || 'Thẻ Visa'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <p className="text-[10px] text-slate-500 dark:text-muted-light uppercase font-bold tracking-wider">
                Thời gian còn lại
              </p>
              <p className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                {countdown || '—'}
              </p>
            </div>
          </div>

          {/* Auto-Renew Switch Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Tự động gia hạn (Auto-renewal)
                </span>
                {subscription.autoRenew ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                    Bật
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30">
                    Dừng khi hết hạn
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg leading-relaxed">
                {subscription.autoRenew
                  ? 'Gói sẽ tự động trừ phí gia hạn tiếp theo khi đến hạn. Hệ thống sẽ cảnh báo trước 24 giờ.'
                  : `Bạn đã hủy gia hạn trước hạn. Gói sẽ tự động dừng khi hết hạn vào ngày ${new Date(subscription.endDate!).toLocaleDateString('vi-VN')}, không tự động thu phí tiếp.`}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {subscription.autoRenew ? (
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer"
                >
                  Hủy gia hạn tự động
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toggleAutoRenew}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition cursor-pointer"
                >
                  Bật lại gia hạn tự động
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty Plan State */
        <div className="bg-white dark:bg-[#161922] p-8 rounded-3xl border border-slate-200 dark:border-white/10 text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center text-3xl mb-3">
            🎬
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bạn chưa có gói hội viên</h2>
          <p className="text-slate-500 dark:text-muted-light text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Đăng ký gói thành viên theo Tuần, Tháng hoặc Năm để mở quyền xem toàn bộ phim không giới hạn!
          </p>
        </div>
      )}

      {/* Subscription Plans Selection Section (Step 1 of Mainflow 2) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>📋 Chọn Gói Thành Viên</span>
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                (Tuần, tháng hoặc năm)
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-muted-light mt-0.5">
              Sau khi kích hoạt gói, hệ thống theo dõi mốc 24h trước ngày gia hạn
            </p>
          </div>

          {/* Billing Cycle Tabs Filter */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setSelectedCycle('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                selectedCycle === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle('week')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                selectedCycle === 'week'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Gói Tuần
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle('month')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                selectedCycle === 'month'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Gói Tháng
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle('year')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                selectedCycle === 'year'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Gói Năm
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {filteredPlans.map((plan) => {
            const isCurrent = subscription.plan?.id === plan.id;
            return (
              <div
                key={plan.id}
                className={`bg-white dark:bg-[#161922] p-5 rounded-3xl border transition-all relative flex flex-col justify-between hover:shadow-xl ${
                  isCurrent
                    ? 'border-purple-500 shadow-md shadow-purple-500/10 ring-2 ring-purple-500/20'
                    : plan.popular
                    ? 'border-purple-400/60 dark:border-purple-500/40 shadow-sm'
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                {/* Popular or Current Badge */}
                {plan.popular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                    Phổ biến nhất
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-sm">
                    ✓ Đang sử dụng
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2 mt-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-foreground">
                      {plan.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 uppercase">
                      {plan.duration} ngày
                    </span>
                  </div>

                  <div className="my-3">
                    <p className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                      {plan.price.toLocaleString('vi-VN')}₫
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Tương đương {(Math.round(plan.price / plan.duration)).toLocaleString('vi-VN')}₫ / ngày
                    </p>
                  </div>

                  <ul className="space-y-2.5 my-4 pt-2 border-t border-slate-100 dark:border-white/5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Select Plan Button */}
                <button
                  type="button"
                  onClick={() => setSelectedPlanForPayment(plan)}
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-2xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25 active:scale-95'
                      : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-900 dark:text-white active:scale-95'
                  }`}
                >
                  {isCurrent ? (
                    <span>Gói Đang Hoạt Động</span>
                  ) : (
                    <>
                      <span>Chọn Gói & Kích Hoạt</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo / Simulation Controls Panel (Super helpful for grading & presentation) */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-white/[0.03] border border-dashed border-purple-300 dark:border-purple-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <h4 className="text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-300">
              Công Cụ Mô Phỏng Mốc Thời Gian (Demo & Kiểm Thử Mainflow 2)
            </h4>
          </div>
          <span className="text-[10px] text-slate-400">Kiểm thử trực tiếp trên FE</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Sử dụng các phím tắt bên dưới để mô phỏng các trạng thái thời gian khác nhau trong Mainflow 2 mà không cần đợi nhiều ngày:
        </p>
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => simulateExpiryTime(20)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>⚠️</span>
            <span>Đặt còn 20h (&lt; 24h: Hiện cảnh báo)</span>
          </button>

          <button
            type="button"
            onClick={() => simulateExpiryTime(72)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border border-blue-500/30 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>📅</span>
            <span>Đặt còn 3 ngày (≥ 24h: Cho phép hủy trước hạn)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const res = renewSubscription();
              setNotification({ type: 'success', text: res.message });
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Mô phỏng tự động thu phí & gia hạn</span>
          </button>
        </div>
      </div>

      {/* MainFlow4: Device Management Section */}
      <div className="pt-2">
        {subscription.plan ? (
          <div className="bg-white dark:bg-[#161922] p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📱</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-foreground">
                    Quản Lý Thiết Bị Đăng Nhập
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Đã mở khóa theo gói
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-muted-light mt-1">
                  Gói <strong className="text-purple-600 dark:text-purple-400">{subscription.plan.name}</strong> cho phép sử dụng tối đa{' '}
                  <strong>
                    {subscription.plan.id === 'week_vip' ? '2' : subscription.plan.id === 'month_vip' ? '4' : 'Không giới hạn'}
                  </strong>{' '}
                  thiết bị đồng thời.
                </p>
              </div>

              {devices.filter((d) => !d.isCurrentDevice).length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị khác không?')) {
                      revokeAllOtherDevices();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>🚪</span>
                  <span>Đăng xuất tất cả thiết bị khác</span>
                </button>
              )}
            </div>

            {/* Device List */}
            <div className="space-y-3 pt-1">
              {devices.map((dev) => (
                <div
                  key={dev.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    dev.isCurrentDevice
                      ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-500/40'
                      : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xl shrink-0">
                      {dev.deviceType === 'desktop' ? '💻' : dev.deviceType === 'tv' ? '📺' : dev.deviceType === 'tablet' ? '📱' : '📲'}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {dev.deviceName}
                        </h4>
                        {dev.isCurrentDevice && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
                            Thiết bị này
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {dev.browser} • {dev.os}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                        📍 {dev.location} ({dev.ipAddress}) • Hoạt động:{' '}
                        <span className={dev.isCurrentDevice ? 'text-emerald-600 font-bold' : ''}>
                          {dev.lastActive}
                        </span>
                      </p>
                    </div>
                  </div>

                  {!dev.isCurrentDevice ? (
                    <button
                      type="button"
                      onClick={() => revokeDevice(dev.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition cursor-pointer self-end sm:self-center"
                    >
                      Đăng xuất
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 self-end sm:self-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Đang xem
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Payment Confirmation Modal (Step 2 of Mainflow 2) */}
      {selectedPlanForPayment && (
        <div
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPlanForPayment(null)}
        >
          <div
            className="bg-white dark:bg-[#161922] w-full max-w-lg p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-white/15 shadow-2xl relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Xác Nhận Thanh Toán & Kích Hoạt
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bước 2 trong quy trình Mainflow 2
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlanForPayment(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Plan Info Summary */}
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/20 mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-purple-900 dark:text-purple-200">
                    {selectedPlanForPayment.name}
                  </h4>
                  <p className="text-xs text-purple-700 dark:text-purple-300/80 mt-0.5">
                    Thời hạn: {selectedPlanForPayment.duration} ngày • Tự động gia hạn khi hết hạn
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                    {selectedPlanForPayment.price.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            </div>

            {/* Select Payment Method */}
            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Chọn phương thức thanh toán
              </label>

              <label
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedPaymentMethod.includes('Visa')
                    ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/20'
                    : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Thẻ Visa / Mastercard</p>
                    <p className="text-[11px] text-slate-400">Thẻ liên kết ****4242</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedPaymentMethod.includes('Visa')}
                  onChange={() => setSelectedPaymentMethod('Thẻ Visa / Mastercard (****4242)')}
                  className="accent-purple-600 w-4 h-4 cursor-pointer"
                />
              </label>

              <label
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedPaymentMethod.includes('Ví MoMo')
                    ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/20'
                    : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">📱</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Ví MoMo / ZaloPay</p>
                    <p className="text-[11px] text-slate-400">Thanh toán qua mã QR tiện lợi</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedPaymentMethod.includes('Ví MoMo')}
                  onChange={() => setSelectedPaymentMethod('Ví MoMo (090****123)')}
                  className="accent-purple-600 w-4 h-4 cursor-pointer"
                />
              </label>

              <label
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedPaymentMethod.includes('Ví Coin')
                    ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/20'
                    : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🪙</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Ví Coin AI Cinema</p>
                    <p className="text-[11px] text-slate-400">Thanh toán trực tiếp bằng Coin</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedPaymentMethod.includes('Ví Coin')}
                  onChange={() => setSelectedPaymentMethod('Ví Coin AI Cinema')}
                  className="accent-purple-600 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            {/* Note on Auto-renewal rule */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-[11px] text-slate-500 dark:text-slate-400 mb-6 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Gói được cài đặt <strong>tự động gia hạn</strong>. Hệ thống sẽ theo dõi và gửi thông báo cảnh báo trước <strong>24h</strong>. Bạn có thể hủy gia hạn trước mốc 24h bất cứ lúc nào.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedPlanForPayment(null)}
                className="flex-1 py-3 rounded-2xl font-bold text-xs bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-white transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="flex-1 py-3 rounded-2xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Thanh Toán & Mở Full Phim</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
