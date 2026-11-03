'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { episodeAccessService } from '@/services/episodeAccessService';
import type { MembershipPlan, MySubscription } from '@/types/episodeAccess';
import { CurrentPlan, PlanList } from './MembershipCards';

interface Notice {
  ok: boolean;
  text: string;
}

/**
 * MF-2 membership, member side: the plan the BE says is open, the paid plans on sale, joining one
 * with Coins (quote, then activate) and the auto-renew switch with its 24-hour deadline (BR-30).
 */
export default function SubscriptionManager() {
  const { isAuthenticated, setWalletBalance, openAuthModal, openDepositModal, syncAccount } = useAppStore();
  const [subscription, setSubscription] = useState<MySubscription | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const reload = useCallback(
    () =>
      Promise.all([episodeAccessService.getMySubscription(), episodeAccessService.getPlans()]).then(([mine, list]) => {
        setSubscription(mine.success ? mine.data : null);
        if (list.success && Array.isArray(list.data)) {
          setPlans(list.data.filter((p) => !p.isFree && p.isActive && p.priceCoins !== null));
        }
      }),
    [],
  );

  useEffect(() => {
    if (isAuthenticated) reload().catch(() => setNotice({ ok: false, text: 'Không tải được thông tin gói.' }));
  }, [isAuthenticated, reload]);

  const join = async (plan: MembershipPlan) => {
    setBusy(plan.id);
    setNotice(null);
    const res = await episodeAccessService.joinPlan(plan.id);
    setBusy(null);
    if (!res.success || !res.data) {
      setNotice({ ok: false, text: res.message || 'Không thể đăng ký gói.' });
      if (res.statusCode === 422) openDepositModal();
      return;
    }
    setWalletBalance(res.data.mainBalance, res.data.bonusBalance);
    setNotice({ ok: true, text: `Đã kích hoạt ${plan.name}, hiệu lực đến ${new Date(res.data.currentPeriodEnd).toLocaleDateString('vi-VN')}.` });
    await Promise.all([reload(), syncAccount()]);
  };

  const toggleRenew = async (resume: boolean) => {
    if (!subscription) return;
    setBusy('renew');
    setNotice(null);
    const res = resume
      ? await episodeAccessService.resumeAutoRenew(subscription.id)
      : await episodeAccessService.cancelAutoRenew(subscription.id);
    setBusy(null);
    if (!res.success) {
      setNotice({ ok: false, text: res.message || 'Không thể đổi cài đặt gia hạn.' });
      return;
    }
    setNotice({ ok: true, text: resume ? 'Đã bật lại tự động gia hạn.' : 'Đã tắt tự động gia hạn; gói dừng khi hết kỳ.' });
    await reload();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">Đăng nhập để xem và đăng ký gói thành viên.</p>
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  const hasRunningPlan = subscription !== null && subscription.status !== 'PENDING';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-foreground tracking-tight">🎬 Gói Thành Viên</h1>
        <p className="text-slate-500 dark:text-muted-light text-xs sm:text-sm mt-1">
          Gói Tháng trả bằng Coin, xem toàn bộ tập đã phát hành và tự gia hạn mỗi kỳ.
        </p>
      </div>

      {notice && (
        <div
          role="status"
          className={`p-3 rounded-xl border text-sm ${
            notice.ok
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
          }`}
        >
          {notice.text}
        </div>
      )}

      <CurrentPlan
        subscription={subscription}
        busy={busy !== null}
        onCancelRenew={() => void toggleRenew(false)}
        onResumeRenew={() => void toggleRenew(true)}
      />

      {!hasRunningPlan && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Chọn gói</h2>
          <PlanList plans={plans} disabled={busy !== null} busyPlanId={busy} onJoin={(plan) => void join(plan)} />
        </section>
      )}

    </div>
  );
}
