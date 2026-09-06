'use client';

import { useAppStore } from '@/store/useAppStore';
import { useState, useMemo } from 'react';

export default function UnlockEpisodeModal() {
  const {
    isUnlockModalOpen,
    selectedEpisodeId,
    closeUnlockModal,
    wallet,
    currentMovie,
    unlockEpisode,
  } = useAppStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  const episode = useMemo(
    () => currentMovie.episodes.find((ep) => ep.id === selectedEpisodeId),
    [currentMovie.episodes, selectedEpisodeId]
  );

  const deduction = useMemo(() => {
    if (!episode) return { mainDeduct: 0, bonusDeduct: 0, total: 0, sufficient: false };
    const price = episode.price;
    const mainDeduct = Math.min(wallet.mainCoin, price);
    const bonusDeduct = Math.min(wallet.bonusCoin, price - mainDeduct);
    const total = mainDeduct + bonusDeduct;
    return { mainDeduct, bonusDeduct, total, sufficient: total >= price };
  }, [episode, wallet]);

  const handleUnlock = async () => {
    if (!episode || !deduction.sufficient) return;
    setIsProcessing(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    const res = unlockEpisode(episode.id);
    setResult(res);
    setIsProcessing(false);
    if (res.success) {
      setTimeout(() => {
        closeUnlockModal();
        setResult(null);
      }, 1500);
    }
  };

  const handleClose = () => {
    closeUnlockModal();
    setResult(null);
    setIsProcessing(false);
  };

  if (!isUnlockModalOpen || !episode) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="glass-card w-full max-w-sm p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success State */}
        {result?.success ? (
          <div className="text-center py-6 animate-bounce-in">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-verified">Mở khóa thành công!</h3>
            <p className="text-muted-light text-sm mt-2">
              Tập {episode.episodeNumber}: {episode.title}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">🪙 Mở Khóa Tập Phim</h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Episode Info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-5">
              <img
                src={episode.thumbnailUrl}
                alt={episode.title}
                className="w-20 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="text-xs text-ruby font-bold">Tập {episode.episodeNumber}</p>
                <p className="text-sm font-medium text-foreground">{episode.title}</p>
                <p className="text-xs text-muted">{episode.duration}</p>
              </div>
            </div>

            {/* Price */}
            <div className="text-center mb-5">
              <p className="text-sm text-muted-light">Giá mở khóa</p>
              <p className="text-3xl font-bold gradient-text-coin">{episode.price} Coins</p>
            </div>

            {/* Wallet Balance */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white/5 text-center">
                <p className="text-[10px] text-muted-light uppercase">🟡 Coin Chính</p>
                <p className="text-lg font-bold text-coin">{wallet.mainCoin}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 text-center">
                <p className="text-[10px] text-muted-light uppercase">🎁 Coin Thưởng</p>
                <p className="text-lg font-bold text-neon">{wallet.bonusCoin}</p>
              </div>
            </div>

            {/* Deduction Breakdown */}
            {deduction.sufficient ? (
              <div className="p-4 rounded-xl bg-verified/10 border border-verified/20 mb-5">
                <p className="text-xs text-muted-light mb-2 font-medium">📊 Bảng kê trừ Coin</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/80">Trừ Coin chính:</span>
                    <span className="font-bold text-coin">-{deduction.mainDeduct}</span>
                  </div>
                  {deduction.bonusDeduct > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/80">Trừ Coin thưởng:</span>
                      <span className="font-bold text-neon">-{deduction.bonusDeduct}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-1.5 flex justify-between text-sm">
                    <span className="text-foreground font-medium">Tổng trừ:</span>
                    <span className="font-bold text-foreground">-{episode.price}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 mb-5">
                <p className="text-danger font-bold text-sm mb-1">⚠️ Số dư không đủ!</p>
                <p className="text-xs text-danger/80">
                  Cần {episode.price} Coin, hiện có {wallet.mainCoin + wallet.bonusCoin} Coin.
                  Thiếu {episode.price - wallet.mainCoin - wallet.bonusCoin} Coin.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {deduction.sufficient ? (
              <button
                onClick={handleUnlock}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-verified to-verified-dark hover:shadow-lg hover:shadow-verified/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  '🔓 Mở khóa tập phim'
                )}
              </button>
            ) : (
              <button
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-coin to-coin-dark hover:shadow-lg hover:shadow-coin/30 transition-all active:scale-95"
              >
                💰 Nạp thêm Coin
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
