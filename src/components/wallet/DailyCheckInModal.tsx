'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { dailyRewardService } from '@/services/dailyRewardService';
import { Backdrop } from '@/components/ui/Backdrop';
import { randomInt, randomUnit } from '@/lib/random';
import type { CheckInResult, DailyRewardStatus } from '@/types/episodeAccess';

const CONFETTI_COLORS = ['#E50914', '#8B5CF6', '#F59E0B', '#10B981', '#3B82F6', '#EC4899'];
/** The BE ladder wraps after 7 days (daily-reward.service LADDER_LENGTH). */
const LADDER_LENGTH = 7;

function drawParticles() {
  return Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: randomUnit() * 100,
    color: CONFETTI_COLORS[randomInt(0, CONFETTI_COLORS.length - 1)],
    delay: randomUnit() * 0.5,
    width: 6 + randomUnit() * 8,
    height: 6 + randomUnit() * 8,
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

type DayState = 'claimed' | 'next' | 'locked';

function dayClass(state: DayState): string {
  if (state === 'next') return 'bg-neon/20 border-2 border-neon glow-neon';
  if (state === 'claimed') return 'bg-verified/20 border border-verified/30';
  return 'bg-white/5 border border-white/10';
}

const DAY_ICON: Record<DayState, string> = { claimed: '✅', next: '🎁', locked: '🔒' };

/**
 * SF-C Daily Check-in: one check-in per Vietnam business day; the streak and the reward of each
 * streak day come from the Admin's ladder on the BE. The wallet shows what the BE credited.
 */
export default function DailyCheckInModal() {
  const { isCheckInModalOpen, setCheckInModalOpen, setWalletBalance, markCheckedInToday } = useAppStore();

  const [status, setStatus] = useState<DailyRewardStatus | null>(null);
  const [claimed, setClaimed] = useState<CheckInResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isCheckInModalOpen) return;
    dailyRewardService
      .getStatus()
      .then((res) => {
        if (res.success && res.data) setStatus(res.data);
        else setErrorMsg(res.message || 'Không tải được thông tin điểm danh.');
      })
      .catch(() => setErrorMsg('Không tải được thông tin điểm danh.'));
  }, [isCheckInModalOpen]);

  const handleClaim = useCallback(async () => {
    setIsClaiming(true);
    setErrorMsg(null);
    const res = await dailyRewardService.checkIn();
    setIsClaiming(false);
    if (!res.success || !res.data) {
      setErrorMsg(res.message || 'Có lỗi xảy ra khi điểm danh.');
      return;
    }
    setClaimed(res.data);
    setWalletBalance(res.data.mainBalance, res.data.bonusBalance);
    markCheckedInToday(res.data.streakDay);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  }, [setWalletBalance, markCheckedInToday]);

  const handleClose = useCallback(() => {
    setCheckInModalOpen(false);
    setClaimed(null);
    setStatus(null);
    setErrorMsg(null);
  }, [setCheckInModalOpen]);

  if (!isCheckInModalOpen) return null;

  const checkedInToday = Boolean(claimed) || Boolean(status?.checkedInToday);
  const streakDay = claimed?.streakDay ?? status?.streakDay ?? 0;
  const nextDay = checkedInToday ? null : (streakDay % LADDER_LENGTH) + 1;
  const todayReward = status ? status.reward.coins + status.reward.bonusCoins : 0;
  const ladder = Array.from({ length: LADDER_LENGTH }, (_, i) => {
    const day = i + 1;
    const rule = status?.ladder.find((r) => r.streakDay === day);
    let state: DayState = 'locked';
    if (day === nextDay) state = 'next';
    else if (day <= streakDay) state = 'claimed';
    return { day, reward: (rule?.coins ?? 0) + (rule?.bonusCoins ?? 0), state };
  });

  let claimLabel = `🎁 Nhận ${todayReward} Coin`;
  if (isClaiming) claimLabel = 'Đang nhận thưởng...';
  else if (checkedInToday) claimLabel = '✓ Đã nhận hôm nay';
  else if (todayReward <= 0) claimLabel = 'Hôm nay chưa có phần thưởng';

  return (
    <>
      {showConfetti && <ConfettiEffect />}

      <Backdrop
        label="Điểm danh hàng ngày"
        onClose={handleClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <div className="glass-card w-full max-w-md p-6 animate-scale-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">🎁 Điểm Danh Hàng Ngày</h2>
              <p className="text-sm text-muted-light mt-1">
                Chuỗi hiện tại: <span className="text-coin font-bold">{streakDay} ngày</span>
              </p>
            </div>
            <button
              type="button"
              aria-label="Đóng"
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-muted-light hover:text-foreground cursor-pointer"
            >
              ✕
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">{errorMsg}</div>
          )}

          <div className="grid grid-cols-7 gap-2 mb-6">
            {ladder.map(({ day, reward, state }) => (
              <div
                key={day}
                className={`relative flex flex-col items-center py-3 rounded-xl transition-all duration-300 ${dayClass(state)}`}
              >
                <span className={`text-[10px] font-bold mb-1 ${state === 'next' ? 'text-neon' : 'text-muted-light'}`}>
                  Ngày {day}
                </span>
                <span className="text-lg mb-1">{DAY_ICON[state]}</span>
                <span className={`text-[10px] font-bold ${state === 'claimed' ? 'text-verified' : 'text-coin'}`}>+{reward}</span>
              </div>
            ))}
          </div>

          {claimed && (
            <div className="mb-4 p-3 rounded-xl bg-verified/20 border border-verified/30 text-center animate-bounce-in">
              <p className="text-verified font-bold text-lg">🎉 Nhận thành công!</p>
              <p className="text-verified/80 text-sm">
                +{claimed.bonusGranted} Coin thưởng
                {claimed.coinsGranted > 0 && ` và +${claimed.coinsGranted} Coin chính`} đã được cộng vào ví
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => void handleClaim()}
            disabled={!status || checkedInToday || isClaiming || todayReward <= 0}
            className="w-full py-3.5 rounded-xl font-bold text-base transition-all duration-300 cursor-pointer bg-gradient-to-r from-neon to-neon-dark text-white hover:shadow-lg hover:shadow-neon/30 active:scale-95 disabled:bg-none disabled:bg-white/10 disabled:text-muted disabled:cursor-not-allowed disabled:shadow-none"
          >
            {claimLabel}
          </button>

          <p className="text-center text-xs text-muted mt-3">Điểm danh liên tục để nhận thưởng theo chuỗi; bỏ một ngày chuỗi bắt đầu lại.</p>
        </div>
      </Backdrop>
    </>
  );
}
