'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { episodeAccessService } from '@/services/episodeAccessService';
import { Backdrop } from '@/components/ui/Backdrop';
import { useAccessDecision } from './unlock/useAccessDecision';
import { CoinBreakdown, GuestPrompt, ObtainCoinActions, PaidInfo, PaidNotice, PayButton } from './unlock/UnlockParts';

type Tab = 'episode' | 'plan';

/**
 * MF-2 Choose Access Method: unlock the episode with Coins or join the monthly plan, both paid in
 * Coins (BR-01). Everything shown - prices, balances, what is missing - is the BE access decision;
 * the wallet and the unlocked flag are updated from what the BE answered, never computed here.
 */
export default function UnlockEpisodeModal() {
  const {
    isUnlockModalOpen,
    selectedEpisodeId,
    closeUnlockModal,
    setWalletBalance,
    currentMovie,
    markEpisodeUnlocked,
    isAuthenticated,
    openAuthModal,
    openDepositModal,
    setCheckInModalOpen,
  } = useAppStore();

  const { decision, monthlyPlan, loading, error } = useAccessDecision(selectedEpisodeId, isUnlockModalOpen);
  const [activeTab, setActiveTab] = useState<Tab>('episode');
  const [isProcessing, setIsProcessing] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paid, setPaid] = useState<PaidInfo | null>(null);

  const episode = useMemo(
    () => currentMovie?.episodes.find((ep) => ep.id === selectedEpisodeId),
    [currentMovie?.episodes, selectedEpisodeId],
  );

  // Access already there (free starter, plan, bought before): nothing to pay, hand off to playback.
  useEffect(() => {
    if (!decision?.accessGranted) return;
    markEpisodeUnlocked(decision.episodeId);
    closeUnlockModal();
  }, [decision, markEpisodeUnlocked, closeUnlockModal]);

  if (!isUnlockModalOpen || !episode) return null;

  const close = () => {
    setPaid(null);
    setPayError(null);
    setActiveTab('episode');
    closeUnlockModal();
  };
  const goTopUp = () => {
    close();
    openDepositModal();
  };
  const goCheckIn = () => {
    close();
    setCheckInModalOpen(true);
  };
  const goAuth = (mode: 'login' | 'register') => {
    close();
    openAuthModal(mode);
  };

  const required = decision?.required;
  const mainBalance = required?.mainBalance ?? 0;
  const bonusBalance = required?.bonusBalance ?? 0;
  const episodePrice = required?.coinPrice ?? null;
  const planPrice = required?.monthlyPlanCoinPrice ?? null;
  const canJoinPlan = planPrice !== null && monthlyPlan !== null;
  const needsLogin = !isAuthenticated || decision?.nextAction === 'REGISTER_OR_LOGIN';

  const finish = (info: PaidInfo, main: number, bonus: number) => {
    setWalletBalance(main, bonus);
    markEpisodeUnlocked(episode.id);
    setPaid(info);
    setTimeout(close, 1800);
  };

  const buyEpisode = async () => {
    setIsProcessing(true);
    setPayError(null);
    const res = await episodeAccessService.purchaseEpisode(episode.id);
    setIsProcessing(false);
    if (!res.success || !res.data) {
      setPayError(res.message || 'Không thể mở khóa tập phim. Vui lòng thử lại.');
      return;
    }
    finish(
      {
        title: 'Mở Khóa Tập Phim Thành Công!',
        description: `${episode.displayLabel ?? `Tập ${episode.episodeNumber}`}: ${episode.title}`,
        paidCoins: res.data.paidCoins,
        chargedMain: res.data.charged.mainCoins,
        chargedBonus: res.data.charged.bonusCoins,
      },
      res.data.mainBalance,
      res.data.bonusBalance,
    );
  };

  const joinPlan = async () => {
    if (!monthlyPlan) return;
    setIsProcessing(true);
    setPayError(null);
    const res = await episodeAccessService.joinPlan(monthlyPlan.id);
    setIsProcessing(false);
    if (!res.success || !res.data) {
      setPayError(res.message || 'Không thể đăng ký gói Tháng. Vui lòng kiểm tra số dư.');
      return;
    }
    finish(
      {
        title: 'Đã Kích Hoạt Gói Tháng!',
        description: `${monthlyPlan.name} có hiệu lực đến ${new Date(res.data.currentPeriodEnd).toLocaleDateString('vi-VN')}.`,
        paidCoins: res.data.priceCoins,
        chargedMain: res.data.charged.mainCoins,
        chargedBonus: res.data.charged.bonusCoins,
      },
      res.data.mainBalance,
      res.data.bonusBalance,
    );
  };

  const tabClass = (tab: Tab, active: string) =>
    `flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
      activeTab === tab ? `bg-slate-800 shadow-md border ${active}` : 'text-slate-400 hover:text-white'
    }`;

  const renderBody = () => {
    if (needsLogin) return <GuestPrompt onLogin={() => goAuth('login')} onRegister={() => goAuth('register')} />;
    if (loading || !decision || episodePrice === null) {
      return <p className="py-8 text-center text-xs text-slate-400">{error ?? 'Đang kiểm tra quyền xem...'}</p>;
    }
    const tab: Tab = canJoinPlan ? activeTab : 'episode';
    const price = tab === 'plan' ? (planPrice ?? 0) : episodePrice;
    const enough = mainBalance + bonusBalance >= price;

    return (
      <>
        {canJoinPlan && (
          <div className="flex p-1 bg-slate-950/60 border border-slate-800 rounded-2xl mb-4">
            <button type="button" onClick={() => setActiveTab('episode')} className={tabClass('episode', 'text-amber-400 border-amber-500/30')}>
              🪙 Mở khóa tập này ({episodePrice} Coin)
            </button>
            <button type="button" onClick={() => setActiveTab('plan')} className={tabClass('plan', 'text-purple-400 border-purple-500/30')}>
              👑 Gói Tháng ({planPrice} Coin)
            </button>
          </div>
        )}

        <div className="space-y-4">
          {tab === 'plan' ? (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 via-indigo-950/40 to-slate-900 border border-purple-500/30">
              <p className="text-xs font-black uppercase tracking-wider text-purple-300 mb-2">👑 {monthlyPlan?.name}</p>
              <ul className="text-xs text-slate-300 space-y-1.5 pl-1">
                <li>✓ Xem mọi tập đã phát hành, không tốn thêm Coin</li>
                <li>✓ Không quảng cáo</li>
                <li>✓ Tự gia hạn bằng Coin mỗi {monthlyPlan?.durationDays} ngày; tắt gia hạn trước kỳ mới ít nhất 24 giờ</li>
              </ul>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
              <div className="min-w-0">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold uppercase">{episode.displayLabel ?? `Tập ${episode.episodeNumber}`}</span>
                <h4 className="text-xs font-bold text-white truncate mt-1">{episode.title}</h4>
              </div>
              <span className="text-base font-black text-amber-400">{episodePrice} Coin</span>
            </div>
          )}

          <CoinBreakdown
            price={price}
            mainBalance={mainBalance}
            bonusBalance={bonusBalance}
            afterLabel={tab === 'plan' ? 'Số dư sau khi đăng ký:' : 'Số dư sau khi mở:'}
          />

          {enough ? (
            <PayButton
              tone={tab === 'plan' ? 'purple' : 'amber'}
              busy={isProcessing}
              busyLabel={tab === 'plan' ? 'Đang kích hoạt gói...' : 'Đang mở khóa...'}
              label={tab === 'plan' ? `👑 Kích hoạt gói Tháng (${price} Coin)` : `🔓 Xác nhận mở khóa (${price} Coin)`}
              onClick={() => void (tab === 'plan' ? joinPlan() : buyEpisode())}
            />
          ) : (
            <ObtainCoinActions onTopUp={goTopUp} onCheckIn={goCheckIn} />
          )}
        </div>
      </>
    );
  };

  return (
    <Backdrop
      label="Mở khóa tập phim"
      onClose={close}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 overflow-hidden animate-scale-in text-white">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600" />
        {paid ? (
          <PaidNotice info={paid} />
        ) : (
          <>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black tracking-wide text-white">🔒 Mở Khóa Tập Phim</h3>
                <p className="text-xs text-slate-400">
                  {currentMovie?.title} • {episode.displayLabel ?? `Tập ${episode.episodeNumber}`}
                </p>
              </div>
              <button
                type="button"
                aria-label="Đóng"
                onClick={close}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {payError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">{payError}</div>
            )}

            {renderBody()}

            <div className="pt-4 mt-4 border-t border-slate-800 text-center">
              <button type="button" onClick={close} className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">
                ✕ Quay lại danh sách phim
              </button>
            </div>
          </>
        )}
      </div>
    </Backdrop>
  );
}
