'use client';

import { useAppStore } from '@/store/useAppStore';
import { useState, useCallback, useEffect } from 'react';

function ConfettiEffect() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);

  useEffect(() => {
    const colors = ['#E50914', '#8B5CF6', '#F59E0B', '#10B981', '#3B82F6', '#EC4899'];
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);
  }, []);

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
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
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
  } = useAppStore();

  const [showConfetti, setShowConfetti] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);

  const handleClaim = useCallback(() => {
    const todayDay = checkInStreak.days.find((d) => d.isToday);
    if (todayDay) setRewardAmount(todayDay.reward);

    const success = claimDailyCheckIn();
    if (success) {
      setClaimSuccess(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
  }, [claimDailyCheckIn, checkInStreak.days]);

  const handleClose = useCallback(() => {
    setCheckInModalOpen(false);
    setClaimSuccess(false);
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
                Streak hiện tại: <span className="text-coin font-bold">{checkInStreak.currentStreak + (claimSuccess ? 1 : 0)} ngày</span>
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-muted-light hover:text-foreground"
            >
              ✕
            </button>
          </div>

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
                  <span className="text-[10px] font-medium text-muted-light mb-1">{day.dayLabel}</span>
                  <span className="text-lg mb-1">
                    {isClaimed ? '✅' : isToday ? '🎁' : isMissed ? '❌' : '🔒'}
                  </span>
                  <span className={`text-[10px] font-bold ${
                    isClaimed ? 'text-verified' : isToday ? 'text-coin' : 'text-muted'
                  }`}>
                    +{day.reward}
                  </span>
                  {isToday && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon rounded-full animate-pulse" />
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
            disabled={todayClaimed}
            className={`w-full py-3.5 rounded-xl font-bold text-base transition-all duration-300 ${
              todayClaimed
                ? 'bg-white/10 text-muted cursor-not-allowed'
                : 'bg-gradient-to-r from-neon to-neon-dark text-white hover:shadow-lg hover:shadow-neon/30 active:scale-95'
            }`}
          >
            {todayClaimed ? (
              <span>✓ Đã nhận hôm nay</span>
            ) : (
              <span>🎁 Nhận {todayDay?.reward || 0} Coin Thưởng</span>
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
