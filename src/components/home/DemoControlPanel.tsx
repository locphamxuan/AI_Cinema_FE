'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';

export default function DemoControlPanel() {
  const { user, isVIPMode, wallet, toggleVIPMode, setWalletBalance, isAuthenticated } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div ref={panelRef} className="fixed bottom-6 left-4 sm:left-6 z-40">
      {/* Popover Control Center (Apple / Glassmorphism Style) */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 w-[340px] sm:w-[380px] max-w-[calc(100vw-2rem)] glass-card p-5 border border-white/20 shadow-2xl shadow-black/80 rounded-2xl animate-scale-in z-50">
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ruby to-neon flex items-center justify-center text-sm shadow-md">
                ⚡
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-none">Trung Tâm Hội Viên</h4>
                <p className="text-[11px] text-muted-light mt-1">Trình diễn quyền lợi & ví tiền tệ kép</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-muted-light hover:text-white flex items-center justify-center text-xs transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* 1. iOS-style Segmented Mode Switcher */}
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-light font-bold mb-2">
                Hạng Tài Khoản
              </p>
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    if (isVIPMode) toggleVIPMode();
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    !isVIPMode
                      ? 'bg-white/15 text-white shadow-md'
                      : 'text-muted-light hover:text-white'
                  }`}
                >
                  <span>👤</span>
                  <span>Thường (Mua lẻ)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isVIPMode) toggleVIPMode();
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isVIPMode
                      ? 'bg-gradient-to-r from-coin to-coin-dark text-black font-extrabold shadow-md shadow-coin/20'
                      : 'text-muted-light hover:text-white'
                  }`}
                >
                  <span>👑</span>
                  <span>VIP (Trọn gói)</span>
                </button>
              </div>
            </div>

            {/* 2. Dual-Wallet Balance Preset Bar */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] uppercase tracking-wider text-muted-light font-bold">
                  Số Dư Ví Kép
                </p>
                <span className="text-[11px] font-mono text-white">
                  {wallet.mainCoin} 🟡 + {wallet.bonusCoin} 🎁
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWalletBalance(120, 80)}
                  className="py-1.5 px-2 rounded-lg bg-verified/15 hover:bg-verified/25 text-verified border border-verified/30 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  <span>💰</span>
                  <span>Đầy đủ (120 + 80)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWalletBalance(15, 10)}
                  className="py-1.5 px-2 rounded-lg bg-danger/15 hover:bg-danger/25 text-danger border border-danger/30 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  <span>🪫</span>
                  <span>Thiếu Coin (15 + 10)</span>
                </button>
              </div>
            </div>

            {/* 3. Quick Navigation Shortcuts */}
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-light font-bold mb-2">
                Lối Tắt Nhanh
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <Link
                  href="/watch/1"
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-ruby/20 border border-white/10 hover:border-ruby/40 text-foreground hover:text-white transition-all flex items-center gap-2"
                >
                  <span>🎬</span>
                  <span className="truncate">Xem phim 4K</span>
                </Link>
                <Link
                  href="/reviewer/projects/create"
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 rounded-xl bg-ruby/10 hover:bg-ruby/20 border border-ruby/30 text-ruby font-bold hover:text-white transition-all flex items-center gap-2"
                >
                  <span>🛡️</span>
                  <span className="truncate">Reviewer Hub</span>
                </Link>
                <Link
                  href="/creator/episodes/ep-prod-03/studio"
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 rounded-xl bg-neon/10 hover:bg-neon/20 border border-neon/30 text-neon font-bold hover:text-white transition-all flex items-center gap-2"
                >
                  <span>✨</span>
                  <span className="truncate">AI Studio Creator</span>
                </Link>
                <Link
                  href="/profile/transactions"
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground hover:text-white transition-all flex items-center gap-2"
                >
                  <span>📋</span>
                  <span className="truncate">Sao kê lịch sử ví</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Pill Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2.5 rounded-full glass-card border border-white/20 text-xs font-bold text-white flex items-center gap-2.5 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
          isOpen
            ? 'bg-ruby/30 border-ruby/60 ring-2 ring-ruby/40 shadow-ruby/20'
            : 'hover:border-neon/50 hover:shadow-neon/20'
        }`}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isVIPMode ? 'bg-coin' : 'bg-verified'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isVIPMode ? 'bg-coin' : 'bg-verified'
            }`}
          />
        </span>
        <span>{isVIPMode ? '👑 VIP Member' : '👤 Tài khoản thường'}</span>
        <span className="text-white/40 font-mono">|</span>
        <span className="text-coin">🟡 {wallet.mainCoin + wallet.bonusCoin}</span>
        <span className="text-[10px] text-muted-light">⚙️</span>
      </button>
    </div>
  );
}
