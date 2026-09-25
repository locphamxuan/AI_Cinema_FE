'use client';

import { CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { SubscriptionPlan } from '@/types/subscription';

export type BillingCycleFilter = 'all' | 'week' | 'month' | 'year';

interface PlanCatalogProps {
  plans: SubscriptionPlan[];
  cycle: BillingCycleFilter;
  onCycleChange: (cycle: BillingCycleFilter) => void;
  onChoose: (plan: SubscriptionPlan) => void;
}

/** Step 1 of MF-2: plans filtered by billing cycle; choosing one opens the payment step. */
export default function PlanCatalog({ plans, cycle, onCycleChange, onChoose }: PlanCatalogProps) {
  const { subscription } = useAppStore();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📋 Chọn Gói Thành Viên</span>
            <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(Tuần, tháng hoặc năm)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-muted-light mt-0.5">
            Sau khi kích hoạt gói, hệ thống theo dõi mốc 24h trước ngày gia hạn
          </p>
        </div>

        {/* Billing Cycle Tabs Filter */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => onCycleChange('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              cycle === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => onCycleChange('week')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              cycle === 'week'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Gói Tuần
          </button>
          <button
            type="button"
            onClick={() => onCycleChange('month')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              cycle === 'month'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Gói Tháng
          </button>
          <button
            type="button"
            onClick={() => onCycleChange('year')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              cycle === 'year'
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
        {plans.map((plan) => {
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
                  <h4 className="text-base font-bold text-slate-900 dark:text-foreground">{plan.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 uppercase">
                    {plan.duration} ngày
                  </span>
                </div>

                <div className="my-3">
                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                    {plan.price.toLocaleString('vi-VN')}₫
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Tương đương {Math.round(plan.price / plan.duration).toLocaleString('vi-VN')}₫ / ngày
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
                onClick={() => onChoose(plan)}
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
  );
}
