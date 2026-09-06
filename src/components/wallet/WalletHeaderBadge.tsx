'use client';

import { useAppStore } from '@/store/useAppStore';
import { useState, useEffect } from 'react';

export default function WalletHeaderBadge() {
  const { wallet, setCheckInModalOpen } = useAppStore();
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

  return (
    <div className="flex items-center gap-3">
      {/* Main Coin */}
      <div className={`flex items-center gap-2 glass-card-sm px-3 py-1.5 cursor-default ${
        coinAnimating ? 'animate-pulse-coin' : ''
      }`}>
        <span className="text-lg">🟡</span>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-light uppercase tracking-wider">Coin Chính</span>
          <span className="text-sm font-bold text-coin">{wallet.mainCoin.toLocaleString()}</span>
        </div>
      </div>

      {/* Bonus Coin */}
      <div
        className={`flex items-center gap-2 glass-card-sm px-3 py-1.5 cursor-pointer hover:bg-card-hover transition-colors ${
          coinAnimating ? 'animate-pulse-coin' : ''
        }`}
        onClick={() => setCheckInModalOpen(true)}
        title="Bấm để điểm danh nhận Coin thưởng"
      >
        <span className="text-lg">🎁</span>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-light uppercase tracking-wider">Coin Thưởng</span>
          <span className="text-sm font-bold text-neon">{wallet.bonusCoin.toLocaleString()}</span>
        </div>
        <div className="ml-1 w-2 h-2 rounded-full bg-neon animate-pulse" />
      </div>
    </div>
  );
}
