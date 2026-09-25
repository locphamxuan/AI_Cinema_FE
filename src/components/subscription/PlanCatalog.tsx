'use client';

import { useAppStore } from '@/store/useAppStore';
import { subscriptionPlans } from '@/mocks/mockData';

/** The membership plans, with the member's current one marked. */
export default function PlanCatalog() {
  const { subscription } = useAppStore();

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-foreground mb-4">📋 Các Gói Dịch Vụ</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {subscriptionPlans.map((plan) => {
          const isCurrent = subscription.plan?.id === plan.id;
          return (
            <div
              key={plan.id}
              className={`glass-card p-5 relative transition-all hover:scale-[1.02] ${
                isCurrent ? 'border-coin/50 glow-coin' : 'border-slate-200 dark:border-white/10'
              } ${plan.popular ? 'border-neon/30' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-neon text-white text-[10px] font-bold uppercase">
                  Phổ biến nhất
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-3 px-3 py-0.5 rounded-full bg-coin text-black text-[10px] font-bold">
                  Gói hiện tại
                </div>
              )}

              <h4 className="text-base font-bold text-slate-900 dark:text-foreground mt-2">{plan.name}</h4>
              <p className="text-2xl font-bold gradient-text-coin mt-2">{plan.price.toLocaleString('vi-VN')}₫</p>
              <p className="text-xs text-slate-500 dark:text-muted-light">/{plan.duration} ngày</p>

              <ul className="mt-4 space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-foreground/70">
                    <span className="text-verified text-sm font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full mt-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isCurrent
                    ? 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-muted cursor-default'
                    : plan.popular
                      ? 'bg-gradient-to-r from-neon to-neon-dark text-white hover:shadow-lg hover:shadow-neon/30 active:scale-95'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:text-foreground dark:hover:bg-white/15'
                }`}
                disabled={isCurrent}
              >
                {isCurrent ? '✓ Đang sử dụng' : 'Chọn gói này'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
