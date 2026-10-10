'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { episodeAccessService } from '@/services/episodeAccessService';
import { walletService } from '@/services/walletService';
import type { AccessDecision, MembershipPlan } from '@/types/episodeAccess';

export default function UnlockEpisodeModal() {
  const {
    isUnlockModalOpen,
    selectedEpisodeId,
    closeUnlockModal,
    wallet,
    setWalletBalance,
    currentMovie,
    unlockEpisode,
    isAuthenticated,
    openAuthModal,
    openDepositModal,
    setCheckInModalOpen,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'episode' | 'subscription'>('episode');
  const [accessDecision, setAccessDecision] = useState<AccessDecision | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    title: string;
    description: string;
    paidCoins: number;
    chargedMain: number;
    chargedBonus: number;
  } | null>(null);

  const episode = useMemo(
    () => currentMovie?.episodes.find((ep) => ep.id === selectedEpisodeId),
    [currentMovie?.episodes, selectedEpisodeId]
  );

  // When modal opens or episode changes, fetch access decision and membership plans
  useEffect(() => {
    if (!isUnlockModalOpen || !selectedEpisodeId) {
      setAccessDecision(null);
      setErrorMsg(null);
      setSuccessInfo(null);
      setIsProcessing(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMsg(null);

    const loadAccessInfo = async () => {
      try {
        const [decisionRes, plansRes] = await Promise.all([
          episodeAccessService.checkAccess(selectedEpisodeId),
          episodeAccessService.getPlans().catch(() => ({ success: false, data: [] })),
        ]);

        if (!isMounted) return;

        if (decisionRes.success && decisionRes.data) {
          setAccessDecision(decisionRes.data);
          // If already granted access, mark unlocked in store and close
          if (decisionRes.data.accessGranted) {
            unlockEpisode(selectedEpisodeId);
            setTimeout(() => {
              if (isMounted) closeUnlockModal();
            }, 500);
            return;
          }
        }

        if (plansRes.success && Array.isArray(plansRes.data) && plansRes.data.length > 0) {
          setPlans(plansRes.data);
          const defaultPlan = plansRes.data.find((p) => p.code === 'MONTHLY') || plansRes.data[0];
          setSelectedPlan(defaultPlan);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err?.message || 'Không thể kiểm tra thông tin mở khóa tập phim.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadAccessInfo();

    return () => {
      isMounted = false;
    };
  }, [isUnlockModalOpen, selectedEpisodeId, closeUnlockModal, unlockEpisode]);

  if (!isUnlockModalOpen || !episode) return null;

  // Real data calculations
  const episodeCoinPrice = accessDecision?.required?.coinPrice ?? episode.price ?? 25;
  const monthlyPlanPrice =
    accessDecision?.required?.monthlyPlanCoinPrice ?? selectedPlan?.priceCoins ?? 900;

  const currentMainBalance = accessDecision?.required?.mainBalance ?? wallet.mainCoin ?? 0;
  const currentBonusBalance = accessDecision?.required?.bonusBalance ?? wallet.bonusCoin ?? 0;
  const totalBalance = currentMainBalance + currentBonusBalance;

  // Option A: Single episode deduction
  const enoughForEpisode = totalBalance >= episodeCoinPrice;
  const missingForEpisode = Math.max(0, episodeCoinPrice - totalBalance);
  const episodeMainDeduct = Math.min(currentMainBalance, episodeCoinPrice);
  const episodeBonusDeduct = Math.min(currentBonusBalance, episodeCoinPrice - episodeMainDeduct);

  // Option B: Subscription deduction
  const enoughForPlan = totalBalance >= monthlyPlanPrice;
  const missingForPlan = Math.max(0, monthlyPlanPrice - totalBalance);
  const planMainDeduct = Math.min(currentMainBalance, monthlyPlanPrice);
  const planBonusDeduct = Math.min(currentBonusBalance, monthlyPlanPrice - planMainDeduct);

  // Purchase Episode (Option A)
  const handlePurchaseEpisode = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await episodeAccessService.purchaseEpisode(episode.id);

      if (res.success && res.data) {
        const charged = res.data.charged || {
          mainCoins: episodeMainDeduct,
          bonusCoins: episodeBonusDeduct,
        };

        // Update local wallet in Zustand
        setWalletBalance(res.data.mainBalance ?? (currentMainBalance - charged.mainCoins), res.data.bonusBalance ?? (currentBonusBalance - charged.bonusCoins));

        // Mark unlocked in movie store
        unlockEpisode(episode.id);

        setSuccessInfo({
          title: 'Mở Khóa Tập Phim Thành Công!',
          description: `Tập ${episode.episodeNumber}: ${episode.title}`,
          paidCoins: res.data.paidCoins || episodeCoinPrice,
          chargedMain: charged.mainCoins,
          chargedBonus: charged.bonusCoins,
        });

        setTimeout(() => {
          closeUnlockModal();
          setSuccessInfo(null);
        }, 1800);
      } else {
        setErrorMsg(res.message || 'Không thể mở khóa tập phim. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra trong quá trình mở khóa.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Subscribe Monthly Plan (Option B)
  const handleSubscribePlan = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await episodeAccessService.subscribePlan(selectedPlan.id);

      if (res.success && res.data) {
        // Refresh wallet
        const balRes = await walletService.getBalance();
        if (balRes.success && balRes.data) {
          setWalletBalance(balRes.data.mainCoin, balRes.data.bonusCoin);
        }

        // Mark episode unlocked
        unlockEpisode(episode.id);

        setSuccessInfo({
          title: 'Đăng Ký Gói Hội Viên Thành Công!',
          description: `Bạn đã trở thành Hội Viên VIP Cinema (${selectedPlan.name}). Tận hưởng trọn bộ phim không giới hạn!`,
          paidCoins: selectedPlan.priceCoins,
          chargedMain: planMainDeduct,
          chargedBonus: planBonusDeduct,
        });

        setTimeout(() => {
          closeUnlockModal();
          setSuccessInfo(null);
        }, 2000);
      } else {
        setErrorMsg(res.message || 'Không thể đăng ký gói hội viên. Vui lòng kiểm tra số dư.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi kích hoạt gói hội viên.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={closeUnlockModal}
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 overflow-hidden animate-scale-in text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Ambient Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600" />

        {/* Success Modal Overlay */}
        {successInfo ? (
          <div className="py-8 text-center animate-bounce-in space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/20">
              ✓
            </div>
            <div>
              <h3 className="text-xl font-black text-emerald-400">{successInfo.title}</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">{successInfo.description}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs font-mono max-w-xs mx-auto space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Đã thanh toán:</span>
                <span className="font-bold text-amber-400">{successInfo.paidCoins} Coins</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Coin Chính: -{successInfo.chargedMain}</span>
                <span>Coin Thưởng: -{successInfo.chargedBonus}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 animate-pulse">Đang bắt đầu phát nội dung...</p>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-bold shadow-inner shadow-amber-500/20">
                  🔒
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-wide text-white">Mở Khóa Tập Phim</h3>
                  <p className="text-xs text-slate-400">
                    {currentMovie?.title} • Tập {episode.episodeNumber}
                  </p>
                </div>
              </div>

              <button
                onClick={closeUnlockModal}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                <span>{errorMsg}</span>
                <button onClick={() => setErrorMsg(null)} className="ml-2 font-bold cursor-pointer">
                  ✕
                </button>
              </div>
            )}

            {/* Guest State: Prompt Login / Register */}
            {!isAuthenticated ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center text-2xl mx-auto">
                  👤
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Bạn chưa đăng nhập</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Vui lòng đăng nhập hoặc tạo tài khoản mới để mở khóa các tập phim độc quyền, nhận Coin thưởng điểm danh và tham gia trải nghiệm VIP.
                  </p>
                </div>
                <div className="flex gap-3 max-w-xs mx-auto pt-2">
                  <button
                    onClick={() => {
                      closeUnlockModal();
                      openAuthModal('login');
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    Đăng Nhập
                  </button>
                  <button
                    onClick={() => {
                      closeUnlockModal();
                      openAuthModal('register');
                    }}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Đăng Ký
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Dual Decision Option Tabs (Main Flow 2) */}
                <div className="flex p-1 bg-slate-950/60 border border-slate-800 rounded-2xl mb-4">
                  <button
                    onClick={() => setActiveTab('episode')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeTab === 'episode'
                        ? 'bg-slate-800 text-amber-400 shadow-md border border-amber-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🪙</span>
                    <span>Mở Khóa Tập Này ({episodeCoinPrice} Coins)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('subscription')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeTab === 'subscription'
                        ? 'bg-slate-800 text-purple-400 shadow-md border border-purple-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>👑</span>
                    <span>Gói VIP Tháng ({monthlyPlanPrice} Coins)</span>
                  </button>
                </div>

                {/* Option Content */}
                {activeTab === 'episode' ? (
                  <div className="space-y-4">
                    {/* Episode Card */}
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                      <img
                        src={episode.thumbnailUrl}
                        alt={episode.title}
                        className="w-20 h-14 rounded-xl object-cover border border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold uppercase">
                          Tập {episode.episodeNumber}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate mt-1">{episode.title}</h4>
                        <p className="text-[11px] text-slate-400">{episode.duration}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-amber-400">{episodeCoinPrice}</span>
                        <span className="text-[10px] text-slate-400 block">Coins</span>
                      </div>
                    </div>

                    {/* Wallet Status & Deduction Breakdown */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Số dư ví của bạn:</span>
                        <div className="flex gap-2 font-mono">
                          <span className="text-amber-400">🟡 {currentMainBalance} Main</span>
                          <span className="text-purple-400">🎁 {currentBonusBalance} Bonus</span>
                        </div>
                      </div>

                      {enoughForEpisode ? (
                        <div className="pt-2 border-t border-slate-800/80 space-y-1 font-mono text-[11px]">
                          <div className="flex justify-between text-slate-300">
                            <span>Trừ Coin chính (Main):</span>
                            <span className="text-amber-400 font-bold">-{episodeMainDeduct}</span>
                          </div>
                          {episodeBonusDeduct > 0 && (
                            <div className="flex justify-between text-slate-300">
                              <span>Trừ Coin thưởng (Bonus):</span>
                              <span className="text-purple-400 font-bold">-{episodeBonusDeduct}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold pt-1 border-t border-slate-800/40 text-emerald-400">
                            <span>Số dư sau khi mở:</span>
                            <span>{totalBalance - episodeCoinPrice} Coins</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                          <p className="font-bold flex items-center gap-1">
                            <span>⚠️</span> Số dư không đủ!
                          </p>
                          <p className="text-[11px] mt-0.5 text-slate-300">
                            Bạn đang có <strong className="text-white">{totalBalance} Coins</strong>, còn thiếu{' '}
                            <strong className="text-rose-400">{missingForEpisode} Coins</strong> để mở khóa.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {enoughForEpisode ? (
                      <button
                        onClick={handlePurchaseEpisode}
                        disabled={isProcessing}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-extrabold text-xs shadow-lg shadow-amber-500/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Đang mở khóa...
                          </span>
                        ) : (
                          <>
                            <span>🔓 Xác nhận mở khóa tập phim</span>
                            <span className="font-mono">({episodeCoinPrice} Coins)</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
                          Lựa chọn nạp & nhận thêm Coin:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              closeUnlockModal();
                              openDepositModal();
                            }}
                            className="py-3 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>💳</span>
                            <span>Nạp VNPay Sandbox</span>
                          </button>
                          <button
                            onClick={() => {
                              closeUnlockModal();
                              setCheckInModalOpen(true);
                            }}
                            className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>🎁</span>
                            <span>Điểm Danh Nhận Coin</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Subscription Benefit Highlight */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1">
                          <span>👑</span> Đặc quyền VIP Pass 30 Ngày
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                          Tiết kiệm 80%
                        </span>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1.5 pl-1">
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-400">✓</span> Mở khóa toàn bộ các tập phim không giới hạn
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-400">✓</span> Xem độ phân giải gốc 4K Ultra HD & Âm thanh vòm
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-400">✓</span> Không quảng cáo & Tự do chuyển đổi phiên bản phim
                        </li>
                      </ul>
                      <div className="mt-3 pt-3 border-t border-purple-500/20 flex justify-between items-center font-mono">
                        <span className="text-xs text-slate-300">Giá gói:</span>
                        <span className="text-lg font-black text-purple-300">{monthlyPlanPrice} Coins / tháng</span>
                      </div>
                    </div>

                    {/* Wallet Status for Plan */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Số dư ví của bạn:</span>
                        <div className="flex gap-2 font-mono">
                          <span className="text-amber-400">🟡 {currentMainBalance}</span>
                          <span className="text-purple-400">🎁 {currentBonusBalance}</span>
                        </div>
                      </div>

                      {enoughForPlan ? (
                        <div className="pt-2 border-t border-slate-800/80 space-y-1 font-mono text-[11px]">
                          <div className="flex justify-between text-slate-300">
                            <span>Trừ Coin chính (Main):</span>
                            <span className="text-amber-400 font-bold">-{planMainDeduct}</span>
                          </div>
                          {planBonusDeduct > 0 && (
                            <div className="flex justify-between text-slate-300">
                              <span>Trừ Coin thưởng (Bonus):</span>
                              <span className="text-purple-400 font-bold">-{planBonusDeduct}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold pt-1 border-t border-slate-800/40 text-emerald-400">
                            <span>Số dư sau khi đăng ký:</span>
                            <span>{totalBalance - monthlyPlanPrice} Coins</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                          <p className="font-bold flex items-center gap-1">
                            <span>⚠️</span> Số dư chưa đủ đăng ký gói VIP!
                          </p>
                          <p className="text-[11px] mt-0.5 text-slate-300">
                            Bạn đang có <strong className="text-white">{totalBalance} Coins</strong>, còn thiếu{' '}
                            <strong className="text-rose-400">{missingForPlan} Coins</strong>.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons for Plan */}
                    {enoughForPlan ? (
                      <button
                        onClick={handleSubscribePlan}
                        disabled={isProcessing}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Đang đăng ký gói...
                          </span>
                        ) : (
                          <>
                            <span>👑 Kích hoạt Gói VIP Tháng Ngay</span>
                            <span className="font-mono">({monthlyPlanPrice} Coins)</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
                          Nạp Coin để kích hoạt VIP:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              closeUnlockModal();
                              openDepositModal();
                            }}
                            className="py-3 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>💳</span>
                            <span>Nạp VNPay Sandbox</span>
                          </button>
                          <button
                            onClick={() => {
                              closeUnlockModal();
                              setCheckInModalOpen(true);
                            }}
                            className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>🎁</span>
                            <span>Điểm Danh Nhận Coin</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Back to Catalog / Close button */}
            <div className="pt-4 mt-4 border-t border-slate-800 text-center">
              <button
                onClick={closeUnlockModal}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1 mx-auto"
              >
                <span>✕</span>
                <span>Quay lại danh sách phim</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
