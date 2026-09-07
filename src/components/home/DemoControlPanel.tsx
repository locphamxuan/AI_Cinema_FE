'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';

export default function DemoControlPanel() {
  const { user, isVIPMode, wallet, toggleVIPMode, setWalletBalance, logout } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="glass-card border border-white/15 overflow-hidden transition-all duration-300">
      {/* Header bar with collapse toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-3.5 flex items-center justify-between cursor-pointer bg-white/[0.02] hover:bg-white/5 transition-colors border-b border-white/10"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🎮</span>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Bảng Điều Khiển Kiểm Thử Đồ Án (Demo Panel)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon/20 text-neon font-mono font-bold">
                1-Click Test
              </span>
            </h3>
            <p className="text-[11px] text-muted-light hidden sm:block">
              Thay đổi nhanh trạng thái tài khoản, ví kép & quyền truy cập
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-light font-medium">
            {isExpanded ? 'Thu gọn' : 'Mở rộng'}
          </span>
          <span className={`text-xs text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in bg-black/20">
          {/* 1. User Status */}
          <div className="glass-card-sm p-3.5 border border-white/10">
            <p className="text-[10px] text-muted-light uppercase tracking-wider font-bold mb-2">
              Tài khoản hiện tại
            </p>
            <div className="flex items-center gap-2.5">
              <img
                src={user?.avatarUrl}
                alt={user?.name || 'User'}
                className="w-9 h-9 rounded-full bg-white/10 border border-white/20 object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{user?.name}</p>
                <p className={`text-[11px] font-bold ${isVIPMode ? 'text-coin' : 'text-muted-light'}`}>
                  {isVIPMode ? '👑 Hội viên VIP' : '👤 Tài khoản thường'}
                </p>
              </div>
            </div>
          </div>

          {/* 2. VIP Toggle */}
          <div className="glass-card-sm p-3.5 border border-white/10 flex flex-col justify-between">
            <p className="text-[10px] text-muted-light uppercase tracking-wider font-bold mb-1.5">
              Chế độ Hội viên VIP
            </p>
            <button
              onClick={toggleVIPMode}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                isVIPMode
                  ? 'bg-coin/20 text-coin border border-coin/40 hover:bg-coin/30 shadow-md shadow-coin/10'
                  : 'bg-white/10 text-muted-light hover:bg-white/15 hover:text-white'
              }`}
            >
              {isVIPMode ? '👑 VIP (Bấm để chuyển Thường)' : '👤 Thường (Bấm bật VIP)'}
            </button>
            <p className="text-[10px] text-muted mt-1.5 line-clamp-1">
              {isVIPMode ? 'Xem tự do không trừ coin' : 'Mua tập khóa phân rã Coin'}
            </p>
          </div>

          {/* 3. Dual Wallet Presets */}
          <div className="glass-card-sm p-3.5 border border-white/10">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] text-muted-light uppercase tracking-wider font-bold">
                Ví kép: {wallet.mainCoin}🟡 + {wallet.bonusCoin}🎁
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setWalletBalance(120, 80)}
                className="py-1.5 rounded-lg bg-verified/20 text-verified border border-verified/30 text-[11px] font-bold hover:bg-verified/30 transition-all active:scale-95"
              >
                💰 Đủ Coin (120+80)
              </button>
              <button
                onClick={() => setWalletBalance(15, 10)}
                className="py-1.5 rounded-lg bg-danger/20 text-danger border border-danger/30 text-[11px] font-bold hover:bg-danger/30 transition-all active:scale-95"
              >
                🪫 Thiếu Coin (15+10)
              </button>
            </div>
          </div>

          {/* 4. Quick Flow Actions */}
          <div className="glass-card-sm p-3.5 border border-white/10 flex flex-col justify-between">
            <p className="text-[10px] text-muted-light uppercase tracking-wider font-bold mb-1.5">
              Luồng kiểm thử nhanh
            </p>
            <div className="flex gap-2">
              <Link
                href="/watch/ep-002"
                className="flex-1 py-1.5 rounded-lg bg-ruby/20 text-ruby border border-ruby/30 text-[11px] font-bold text-center hover:bg-ruby/30 transition-all"
              >
                🔒 Tập 2 khóa
              </Link>
              <Link
                href="/profile/transactions"
                className="flex-1 py-1.5 rounded-lg bg-neon/20 text-neon border border-neon/30 text-[11px] font-bold text-center hover:bg-neon/30 transition-all"
              >
                📋 Sao kê ví
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
