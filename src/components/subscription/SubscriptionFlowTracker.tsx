'use client';

import { CheckCircle2, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

/** The four MF-2 steps (choose, pay, watch, renew) with the member's current one highlighted. */
export default function SubscriptionFlowTracker() {
  const { subscription, isVIPMode } = useAppStore();

  return (
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
          <span>{subscription.autoRenew ? '4️⃣ Tự động gia hạn' : '4️⃣ Dừng khi hết hạn'}</span>
        </div>
      </div>
    </div>
  );
}
