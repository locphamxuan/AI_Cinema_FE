'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { rewardSpinService } from '@/services/rewardSpinService';
import { Backdrop } from '@/components/ui/Backdrop';
import type { RewardPrize, RewardSpinHistoryItem, SpinResult } from '@/types/episodeAccess';
import { ConfettiEffect, landingRotation, SPIN_MS, SpinWheel } from './spin/SpinWheel';

interface Wheel {
  availableSpins: number;
  prizes: RewardPrize[];
  history: RewardSpinHistoryItem[];
}

const planUntil = (end: string | null) => (end ? `, gói hiệu lực đến ${new Date(end).toLocaleDateString('vi-VN')}` : '');

/** BR-09: the reward wheel. A milestone check-in earns a spin; the BE draws the prize and pays it. */
export default function RewardSpinModal() {
  const isOpen = useAppStore((s) => s.isRewardSpinModalOpen);
  // Mounted only while open, so every opening starts from a fresh load.
  return isOpen ? <SpinDialog /> : null;
}

function SpinDialog() {
  const { closeRewardSpinModal, setWalletBalance } = useAppStore();
  const [wheel, setWheel] = useState<Wheel | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastWon, setLastWon] = useState<SpinResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // The result shows once the wheel stops; closing the modal must not let it land later.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    rewardSpinService
      .getWheelStatus()
      .then((res) => {
        if (res.success && res.data) setWheel(res.data);
        else setErrorMsg(res.message || 'Không tải được thông tin vòng quay.');
      })
      .catch(() => setErrorMsg('Không tải được thông tin vòng quay.'));
  }, []);

  const availableSpins = wheel?.availableSpins ?? 0;
  const prizes = wheel?.prizes ?? [];

  const handleClose = () => {
    if (!isSpinning) closeRewardSpinModal();
  };

  const land = (won: SpinResult) => {
    setIsSpinning(false);
    setLastWon(won);
    setWalletBalance(won.mainBalance, won.bonusBalance);
    setShowConfetti(true);
    timers.current.push(setTimeout(() => setShowConfetti(false), 3000));
    setWheel((w) =>
      w && {
        ...w,
        availableSpins: won.availableSpins,
        history: [{ ...won, status: 'USED' as const }, ...w.history].slice(0, 10),
      },
    );
  };

  const handleSpin = async () => {
    if (isSpinning || availableSpins <= 0 || prizes.length === 0) return;
    setIsSpinning(true);
    setErrorMsg(null);
    setLastWon(null);
    const res = await rewardSpinService.spin();
    if (!res.success || !res.data) {
      setIsSpinning(false);
      setErrorMsg(res.message || 'Lỗi khi quay thưởng. Vui lòng thử lại.');
      return;
    }
    const won = res.data;
    const index = Math.max(
      0,
      prizes.findIndex((p) => p.id === won.prize.id),
    );
    setRotation((r) => landingRotation(r, index, prizes.length));
    timers.current.push(setTimeout(() => land(won), SPIN_MS));
  };

  let spinLabel = 'Hết lượt quay';
  if (isSpinning) spinLabel = 'Đang quay...';
  else if (availableSpins > 0) spinLabel = `Quay ngay (${availableSpins})`;

  return (
    <>
      {showConfetti && <ConfettiEffect />}
      <Backdrop
        label="Vòng quay may mắn"
        onClose={handleClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <div className="glass-card w-full max-w-lg p-6 animate-scale-in relative my-8">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-black text-white">🎯 Vòng Quay May Mắn</h2>
              <p className="text-xs text-muted-light mt-0.5">Mỗi lượt quay trúng Coin thưởng hoặc thêm ngày gói Tháng</p>
            </div>
            <button
              type="button"
              aria-label="Đóng"
              onClick={handleClose}
              disabled={isSpinning}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-muted-light hover:text-white cursor-pointer disabled:opacity-40"
            >
              ✕
            </button>
          </div>

          {errorMsg && (
            <div role="alert" className="mb-4 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="mb-4 flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20 border border-purple-500/30">
            <span className="text-xs font-semibold text-purple-200">Lượt quay của bạn:</span>
            <span className="text-sm font-black text-amber-400 bg-black/40 px-3 py-1 rounded-full border border-amber-500/40">
              {availableSpins} lượt
            </span>
          </div>

          <div className="flex flex-col items-center my-4">
            {wheel && prizes.length === 0 && <p className="text-xs text-muted-light py-10">Vòng quay chưa có giải thưởng nào.</p>}
            {prizes.length > 0 && <SpinWheel prizes={prizes} rotation={rotation} spinning={isSpinning} />}
            <button
              type="button"
              onClick={() => void handleSpin()}
              disabled={isSpinning || availableSpins <= 0 || prizes.length === 0}
              className="mt-6 w-full max-w-xs py-3.5 px-6 rounded-2xl font-black text-base uppercase tracking-wider transition-all duration-200 cursor-pointer bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-neutral-950 hover:brightness-110 active:scale-95 shadow-lg shadow-amber-500/25 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {spinLabel}
            </button>
            {wheel && availableSpins <= 0 && !isSpinning && (
              <p className="text-[11px] text-muted-light mt-2 text-center">Điểm danh tới ngày mốc của chuỗi để nhận thêm lượt quay.</p>
            )}
          </div>

          {lastWon && (
            <div role="status" className="mt-4 p-4 rounded-2xl bg-verified/20 border border-verified/40 text-center animate-bounce-in">
              <h3 className="text-base font-bold text-verified">🎉 Chúc mừng bạn trúng thưởng!</h3>
              <p className="text-white font-extrabold text-lg mt-0.5">{lastWon.prize.name}</p>
              <p className="text-xs text-verified/90 mt-1">
                {lastWon.bonusCoins
                  ? `+${lastWon.bonusCoins} Coin thưởng đã được cộng vào ví của bạn.`
                  : `+${lastWon.planDays} ngày gói Tháng${planUntil(lastWon.planActiveUntil)}.`}
              </p>
            </div>
          )}

          {wheel && wheel.history.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold text-slate-300 mb-2">Lịch sử quay gần đây</h4>
              <ul className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {wheel.history.slice(0, 5).map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300"
                  >
                    <span>{item.prize?.name ?? 'Giải thưởng'}</span>
                    <span className="text-muted-light font-mono text-[10px]">
                      {item.spunAt ? new Date(item.spunAt).toLocaleDateString('vi-VN') : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Backdrop>
    </>
  );
}
