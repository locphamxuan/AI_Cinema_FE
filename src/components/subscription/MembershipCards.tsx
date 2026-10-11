'use client';

import { useNow } from '@/hooks/useNow';
import type { MembershipPlan, MySubscription } from '@/types/episodeAccess';

const day = (iso: string | null) => (iso ? new Date(iso).toLocaleString('vi-VN') : '—');

interface CurrentPlanProps {
  subscription: MySubscription | null;
  busy: boolean;
  onCancelRenew: () => void;
  onResumeRenew: () => void;
}

/** The member's open plan as the BE reports it, with the auto-renew switch (BR-30). */
export function CurrentPlan({ subscription, busy, onCancelRenew, onResumeRenew }: Readonly<CurrentPlanProps>) {
  const now = useNow(60_000).getTime();
  if (!subscription || subscription.status === 'PENDING') {
    return (
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03]">
        <p className="text-sm font-bold text-slate-900 dark:text-white">Bạn đang dùng gói Thường</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Xem các tập miễn phí kèm quảng cáo; tập khác mở khóa bằng Coin hoặc đăng ký gói Tháng bên dưới.
        </p>
      </div>
    );
  }

  const pastDue = subscription.status === 'PAST_DUE';
  const deadlinePassed = subscription.cancelDeadline !== null && new Date(subscription.cancelDeadline).getTime() <= now;

  return (
    <div className="p-5 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase font-bold tracking-wider text-purple-500">Gói hiện tại</p>
          <p className="text-lg font-black text-slate-900 dark:text-white">{subscription.plan.name}</p>
        </div>
        <span className="text-sm font-black text-amber-500">{subscription.priceCoins} Coin / {subscription.plan.durationDays} ngày</span>
      </div>

      {pastDue && (
        <p className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-300">
          Gia hạn chưa thành công vì ví không đủ Coin. Nạp Coin để hệ thống thử lại trước khi gói kết thúc.
        </p>
      )}

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="text-slate-500">Hiệu lực đến</dt>
          <dd className="font-bold text-slate-900 dark:text-white">{day(subscription.currentPeriodEnd)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Tự gia hạn</dt>
          <dd className="font-bold text-slate-900 dark:text-white">
            {subscription.autoRenew ? `Bật — ${day(subscription.nextRenewalAt)}` : 'Tắt — gói dừng khi hết hạn'}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Hạn chót tắt gia hạn</dt>
          <dd className="font-bold text-slate-900 dark:text-white">{subscription.autoRenew ? day(subscription.cancelDeadline) : '—'}</dd>
        </div>
      </dl>

      {subscription.autoRenew ? (
        <button
          type="button"
          disabled={busy || deadlinePassed}
          onClick={onCancelRenew}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deadlinePassed ? 'Đã quá hạn tắt gia hạn cho kỳ này' : 'Tắt tự động gia hạn'}
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={onResumeRenew}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
        >
          Bật lại tự động gia hạn
        </button>
      )}
      <p className="text-[11px] text-slate-500">Tắt gia hạn không hoàn Coin; bạn vẫn xem được đến hết kỳ đã trả.</p>
    </div>
  );
}

interface PlanListProps {
  plans: MembershipPlan[];
  disabled: boolean;
  busyPlanId: string | null;
  onJoin: (plan: MembershipPlan) => void;
}

/** Paid plans on sale, priced in Coins (BR-01); joining pays the first cycle from the wallet. */
export function PlanList({ plans, disabled, busyPlanId, onJoin }: Readonly<PlanListProps>) {
  if (plans.length === 0) {
    return <p className="text-xs text-slate-500">Hiện chưa có gói trả phí nào được mở bán.</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {plans.map((plan) => (
        <div key={plan.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-black text-slate-900 dark:text-white">{plan.name}</p>
            {plan.isFeatured && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600">Nổi bật</span>}
          </div>
          {plan.description && <p className="text-xs text-slate-500 dark:text-slate-400">{plan.description}</p>}
          <p className="text-sm font-black text-amber-500">
            {plan.priceCoins} Coin / {plan.durationDays} ngày
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <li>✓ Xem mọi tập đã phát hành, không tốn thêm Coin</li>
            <li>✓ Không quảng cáo</li>
            <li>✓ Tự gia hạn bằng Coin, tắt trước kỳ mới ít nhất 24 giờ</li>
          </ul>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onJoin(plan)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busyPlanId === plan.id ? 'Đang thanh toán...' : `Đăng ký với ${plan.priceCoins} Coin`}
          </button>
        </div>
      ))}
    </div>
  );
}
