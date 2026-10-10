'use client';

import { useAppStore } from '@/store/useAppStore';
import { useState, useCallback, useEffect } from 'react';
import { dailyRewardService } from '@/services/dailyRewardService';
import { walletService } from '@/services/walletService';

const CONFETTI_COLORS = ['#E50914', '#8B5CF6', '#F59E0B', '#10B981', '#3B82F6', '#EC4899'];

function drawParticles() {
  return Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 0.5,
    width: 6 + Math.random() * 8,
    height: 6 + Math.random() * 8,
  }));
}

function ConfettiEffect() {
  const [particles] = useState(drawParticles);

  return (
    <div className="confetti-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            width: `${p.width}px`,
            height: `${p.height}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function DailyCheckInModal() {
  const {
    isCheckInModalOpen,
    setCheckInModalOpen,
    checkInStreak,
    claimDailyCheckIn,
    syncCheckInStreak,
    setWalletBalance,
    wallet,
  } = useAppStore();

  const [showConfetti, setShowConfetti] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(10);
  const [isClaiming, setIsClaiming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isCheckInModalOpen) {
      syncCheckInStreak();
      // Fetch fresh server status
      dailyRewardService.getStatus().then((res) => {
        if (res.success && res.data) {
          if (res.data.checkedInToday) {
            setClaimSuccess(true);
          }
          if (res.data.reward?.bonusCoins) {
            setRewardAmount(res.data.reward.bonusCoins);
          }
        }
      }).catch(() => {});
    }
  }, [isCheckInModalOpen, syncCheckInStreak]);

  const handleClaim = useCallback(async () => {
    setIsClaiming(true);
    setErrorMsg(null);

    try {
      const res = await dailyRewardService.checkIn();
      if (res.success && res.data) {
        const reward = res.data.reward?.bonusCoins ?? res.data.rewardCoins ?? 10;
        setRewardAmount(reward);
        setClaimSuccess(true);
        setShowConfetti(true);

        // Update wallet in Zustand
        if (res.data.mainBalance !== undefined && res.data.bonusBalance !== undefined) {
          setWalletBalance(res.data.mainBalance, res.data.bonusBalance);
        } else {
          setWalletBalance(wallet.mainCoin, wallet.bonusCoin + reward);
        }

        claimDailyCheckIn();
        setTimeout(() => setShowConfetti(false), 2500);
      } else {
        // Fallback to local
        claimDailyCheckIn();
        setClaimSuccess(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
      }
    } catch (err: any) {
      if (err?.message?.includes('ALREADY_CHECKED_IN_TODAY')) {
        setClaimSuccess(true);
        setErrorMsg('Bạn đã điểm danh ngày hôm nay rồi.');
      } else {
        setErrorMsg(err?.message || 'Có lỗi xảy ra khi điểm danh.');
      }
    } finally {
      setIsClaiming(false);
    }
  }, [claimDailyCheckIn, setWalletBalance, wallet]);

  const handleClose = useCallback(() => {
    setCheckInModalOpen(false);
    setClaimSuccess(false);
    setErrorMsg(null);
  }, [setCheckInModalOpen]);

  if (!isCheckInModalOpen) return null;

  const todayDay = checkInStreak.days.find((d) => d.isToday);
  const todayClaimed = checkInStreak.todayClaimed || claimSuccess;

  return (
    <>
      {showConfetti && <ConfettiEffect />}

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          className="glass-card w-full max-w-md p-6 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">🎁 Điểm Danh Hàng Ngày</h2>
              <p className="text-sm text-muted-light mt-1">
                Streak hiện tại: <span className="text-coin font-bold">{checkInStreak.currentStreak + (claimSuccess && !checkInStreak.todayClaimed ? 1 : 0)} ngày</span>
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-muted-light hover:text-foreground cursor-pointer"
            >
              ✕
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Streak Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-light mb-2">
              <span>Tiến trình tuần</span>
              <span>{checkInStreak.days.filter((d) => d.claimed || (d.isToday && claimSuccess)).length}/7 ngày</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon to-coin rounded-full transition-all duration-700"
                style={{
                  width: `${(checkInStreak.days.filter((d) => d.claimed || (d.isToday && claimSuccess)).length / 7) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* 7-Day Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {checkInStreak.days.map((day) => {
              const isClaimed = day.claimed || (day.isToday && claimSuccess);
              const isToday = day.isToday;
              const isPast = day.dayIndex < (checkInStreak.days.find((d) => d.isToday)?.dayIndex ?? 7);
              const isMissed = isPast && !day.claimed;

              return (
                <div
                  key={day.dayIndex}
                  className={`relative flex flex-col items-center py-3 rounded-xl transition-all duration-300 ${
                    isToday && !isClaimed
                      ? 'bg-neon/20 border-2 border-neon glow-neon'
                      : isClaimed
                        ? 'bg-verified/20 border border-verified/30'
                        : isMissed
                          ? 'bg-white/5 border border-white/5 opacity-50'
                          : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <span className={`text-[10px] font-bold mb-1 ${isToday ? 'text-neon' : 'text-muted-light'}`}>{day.dayLabel}</span>
                  <span className="text-lg mb-1">
                    {isClaimed ? '✅' : isToday ? '🎁' : isMissed ? '❌' : '🔒'}
                  </span>
                  <span className={`text-[10px] font-bold ${
                    isClaimed ? 'text-verified' : isToday ? 'text-coin' : 'text-muted'
                  }`}>
                    +{day.reward}
                  </span>
                  {isToday && (
                    <span className="mt-1 px-1.5 py-0.5 rounded-full text-[8px] font-extrabold bg-neon text-black leading-none shadow-xs">
                      Hôm nay
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Success Message */}
          {claimSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-verified/20 border border-verified/30 text-center animate-bounce-in">
              <p className="text-verified font-bold text-lg">🎉 Nhận thành công!</p>
              <p className="text-verified/80 text-sm">+{rewardAmount} Coin Thưởng đã được cộng vào ví</p>
            </div>
          )}

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            disabled={todayClaimed || isClaiming}
            className={`w-full py-3.5 rounded-xl font-bold text-base transition-all duration-300 cursor-pointer ${
              todayClaimed
                ? 'bg-white/10 text-muted cursor-not-allowed'
                : 'bg-gradient-to-r from-neon to-neon-dark text-white hover:shadow-lg hover:shadow-neon/30 active:scale-95'
            }`}
          >
            {isClaiming ? (
              <span>Đang nhận thưởng...</span>
            ) : todayClaimed ? (
              <span>✓ Đã nhận hôm nay</span>
            ) : (
              <span>🎁 Nhận {todayDay?.reward || rewardAmount} Coin Thưởng</span>
            )}
          </button>

          {/* Info */}
          <p className="text-center text-xs text-muted mt-3">
            Điểm danh liên tục 7 ngày để nhận thưởng tối đa!
          </p>
        </div>
      </div>
    </>
  );
}
