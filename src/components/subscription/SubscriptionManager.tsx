'use client';

import { useAppStore } from '@/store/useAppStore';
import { useNow } from '@/hooks/useNow';
import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { subscriptionPlans } from '@/mocks/subscription';
import type { SubscriptionPlan } from '@/types/subscription';
import CurrentPlanCard from './CurrentPlanCard';
import DeviceManager from './DeviceManager';
import PaymentModal from './PaymentModal';
import PlanCatalog, { type BillingCycleFilter } from './PlanCatalog';
import SubscriptionFlowTracker from './SubscriptionFlowTracker';
import SubscriptionSimulator, { type SubscriptionNotice } from './SubscriptionSimulator';

const HOUR_MS = 3_600_000;

function formatCountdown(msLeft: number | null): string {
  if (msLeft === null) return '';
  if (msLeft <= 0) return 'Đã hết hạn';
  const hours = Math.floor(msLeft / HOUR_MS);
  const minutes = Math.floor((msLeft % HOUR_MS) / 60_000);
  const seconds = Math.floor((msLeft % 60_000) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
}

export default function SubscriptionManager() {
  const { subscription, cancelSubscription, activateSubscription } = useAppStore();

  // Selected billing cycle filter
  const [selectedCycle, setSelectedCycle] = useState<BillingCycleFilter>('all');

  // Payment confirmation modal state
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Thẻ Visa / Mastercard (****4242)');
  const [notification, setNotification] = useState<SubscriptionNotice | null>(null);

  // Hours and the live countdown until the plan renews or ends.
  const now = useNow(1000).getTime();
  const msLeft = subscription.endDate ? new Date(subscription.endDate).getTime() - now : null;
  const hoursUntilRenewal = msLeft === null ? null : msLeft <= 0 ? 0 : Math.round((msLeft / HOUR_MS) * 10) / 10;
  const countdown = formatCountdown(msLeft);

  // Mainflow 2 logic: is inside 24h window?
  const isExpiringWithin24h = hoursUntilRenewal !== null && hoursUntilRenewal <= 24 && hoursUntilRenewal > 0;
  const showRenewalWarning = isExpiringWithin24h && subscription.autoRenew;

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
                Gói <strong className="text-slate-900 dark:text-white">{subscription.plan?.name}</strong> của bạn sẽ tự
                động gia hạn sau{' '}
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm px-1.5 py-0.5 rounded bg-amber-500/10">
                  {countdown}
                </span>
                . Hệ thống sẽ tự động trừ phí chu kỳ tiếp theo:{' '}
                <strong className="text-purple-600 dark:text-purple-400">
                  {subscription.plan?.price.toLocaleString('vi-VN')}₫
                </strong>
                .
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

      <SubscriptionFlowTracker />

      <CurrentPlanCard countdown={countdown} onCancel={handleCancelClick} />
      <PlanCatalog
        plans={filteredPlans}
        cycle={selectedCycle}
        onCycleChange={setSelectedCycle}
        onChoose={setSelectedPlanForPayment}
      />
      <SubscriptionSimulator onNotify={setNotification} />
      <DeviceManager />
      {selectedPlanForPayment && (
        <PaymentModal
          plan={selectedPlanForPayment}
          method={selectedPaymentMethod}
          onMethodChange={setSelectedPaymentMethod}
          onClose={() => setSelectedPlanForPayment(null)}
          onConfirm={handleConfirmPayment}
        />
      )}
    </div>
  );
}
