'use client';

import { useAppStore } from '@/store/useAppStore';
import { useState, useEffect } from 'react';

export default function WalletHeaderBadge() {
  const { wallet, setCheckInModalOpen, checkInStreak } = useAppStore();
  const [coinAnimating, setCoinAnimating] = useState(false);
  const [prevMainCoin, setPrevMainCoin] = useState(wallet.mainCoin);
  const [prevBonusCoin, setPrevBonusCoin] = useState(wallet.bonusCoin);

  useEffect(() => {
    if (wallet.mainCoin !== prevMainCoin || wallet.bonusCoin !== prevBonusCoin) {
      setCoinAnimating(true);
      setPrevMainCoin(wallet.mainCoin);
      setPrevBonusCoin(wallet.bonusCoin);
      const timer = setTimeout(() => setCoinAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [wallet.mainCoin, wallet.bonusCoin, prevMainCoin, prevBonusCoin]);

  const todayClaimed = checkInStreak.todayClaimed;

  return (
    <div className="flex items-center">
      {/* Unified Frosted Glass Dual-Wallet Capsule */}
      <div className="flex items-center rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 p-1 backdrop-blur-xl shadow-lg transition-all">
        {/* 1. Main Coin Section */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
            coinAnimating ? 'animate-pulse-coin' : ''
          }`}
          title="Coin Chính (Dùng để mở khóa tập phim & nâng cấp)"
        >
          {/* Gold Coin SVG */}
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <span className="text-[10px] font-black text-black leading-none">C</span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-xs font-extrabold text-amber-400 font-mono tracking-tight">
              {wallet.mainCoin.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Subtle Divider Line */}
        <div className="h-3.5 w-[1px] bg-white/15 my-auto" />

        {/* 2. Bonus Coin & Daily Check-in Button */}
        <button
          onClick={() => setCheckInModalOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:bg-white/10 transition-all cursor-pointer group ${
            coinAnimating ? 'animate-pulse-coin' : ''
          }`}
          title="Coin Thưởng • Bấm để điểm danh nhận quà hàng ngày"
        >
          {/* Purple Bonus Gift SVG */}
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0 group-hover:scale-110 transition-transform">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 8v13m0-13V4a2 2 0 10-4 0v4m4 0V4a2 2 0 114 0v4m-8 0h8m-10 4h12a2 2 0 012 2v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5a2 2 0 012-2z"
              />
            </svg>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-xs font-extrabold text-purple-300 font-mono tracking-tight group-hover:text-white transition-colors">
              +{wallet.bonusCoin.toLocaleString()}
            </span>
          </div>

          {/* Unclaimed check-in pulse indicator */}
          {!todayClaimed && (
            <span className="relative flex h-2 w-2 ml-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
