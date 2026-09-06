'use client';

import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';

export default function HomePage() {
  const { wallet, isVIPMode, user, subscription, currentMovie, toggleVIPMode, setWalletBalance } =
    useAppStore();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        <img
          src={currentMovie.bannerUrl}
          alt={currentMovie.title}
          className="w-full h-[300px] sm:h-[400px] object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {currentMovie.genre.map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded bg-ruby/20 text-ruby text-xs font-bold"
              >
                {g}
              </span>
            ))}
            <span className="px-2 py-0.5 rounded bg-verified/20 text-verified text-xs font-bold">
              🤖 100% AI
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-2">
            {currentMovie.title}
          </h1>
          <p className="text-muted-light text-sm sm:text-base max-w-xl line-clamp-2 mb-4">
            {currentMovie.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/watch/ep-001"
              className="px-6 py-3 bg-gradient-to-r from-ruby to-ruby-dark text-white rounded-xl font-bold hover:shadow-lg hover:shadow-ruby/30 transition-all active:scale-95"
            >
              ▶ Xem ngay
            </Link>
            <Link
              href="/profile/subscription"
              className="px-6 py-3 glass-card-sm text-foreground font-bold hover:bg-card-hover transition-all"
            >
              👑 Nâng cấp VIP
            </Link>
          </div>
        </div>
      </div>

      {/* Demo Control Panel */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl">🎮</span>
          <div>
            <h2 className="text-lg font-bold text-foreground">Bảng Điều Khiển Demo</h2>
            <p className="text-xs text-muted-light">
              Thay đổi trạng thái để test các flow nghiệp vụ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* User Info Card */}
          <div className="glass-card-sm p-4">
            <p className="text-[10px] text-muted-light uppercase tracking-wider mb-2">Người dùng</p>
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-10 h-10 rounded-full bg-white/10"
              />
              <div>
                <p className="text-sm font-bold text-foreground">{user.name}</p>
                <p className={`text-xs font-bold ${isVIPMode ? 'text-coin' : 'text-muted-light'}`}>
                  {isVIPMode ? '👑 Hội viên VIP' : '👤 Tài khoản thường'}
                </p>
              </div>
            </div>
          </div>

          {/* VIP Toggle Card */}
          <div className="glass-card-sm p-4">
            <p className="text-[10px] text-muted-light uppercase tracking-wider mb-2">
              Chế độ VIP
            </p>
            <button
              onClick={toggleVIPMode}
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                isVIPMode
                  ? 'bg-coin/20 text-coin border border-coin/30 hover:bg-coin/30'
                  : 'bg-white/10 text-muted-light hover:bg-white/15'
              }`}
            >
              {isVIPMode ? '👑 VIP (Click để tắt)' : '👤 Thường (Click bật VIP)'}
            </button>
            <p className="text-[10px] text-muted mt-2">
              {isVIPMode
                ? 'Xem phim không cần trừ coin'
                : 'Cần mua tập hoặc nạp coin để xem'}
            </p>
          </div>

          {/* Wallet Control */}
          <div className="glass-card-sm p-4">
            <p className="text-[10px] text-muted-light uppercase tracking-wider mb-2">Số dư ví</p>
            <div className="space-y-2">
              <button
                onClick={() => setWalletBalance(120, 80)}
                className="w-full py-1.5 rounded-lg bg-verified/20 text-verified text-xs font-medium hover:bg-verified/30 transition-colors"
              >
                💰 Đủ tiền (120 + 80)
              </button>
              <button
                onClick={() => setWalletBalance(15, 10)}
                className="w-full py-1.5 rounded-lg bg-danger/20 text-danger text-xs font-medium hover:bg-danger/30 transition-colors"
              >
                🪫 Thiếu tiền (15 + 10)
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="glass-card-sm p-4">
            <p className="text-[10px] text-muted-light uppercase tracking-wider mb-2">
              Truy cập nhanh
            </p>
            <div className="space-y-2">
              <Link
                href="/watch/ep-002"
                className="block w-full py-1.5 rounded-lg bg-ruby/20 text-ruby text-xs font-medium text-center hover:bg-ruby/30 transition-colors"
              >
                🔒 Xem tập phim khóa
              </Link>
              <Link
                href="/profile/transactions"
                className="block w-full py-1.5 rounded-lg bg-neon/20 text-neon text-xs font-medium text-center hover:bg-neon/30 transition-colors"
              >
                📋 Lịch sử giao dịch
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">📺 Danh Sách Tập Phim</h2>
          <Link
            href="/watch/ep-001"
            className="text-xs text-neon hover:text-neon-dark transition-colors"
          >
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {currentMovie.episodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/watch/${ep.id}`}
              className="group glass-card-sm overflow-hidden hover:scale-[1.03] transition-transform"
            >
              <div className="relative aspect-video">
                <img
                  src={ep.thumbnailUrl}
                  alt={ep.title}
                  className="w-full h-full object-cover"
                />
                {!ep.isFree && !ep.isUnlocked && !isVIPMode && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-2xl">🔒</span>
                  </div>
                )}
                {ep.isFree && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-verified/90 text-white text-[9px] font-bold">
                    FREE
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs text-ruby font-bold">Tập {ep.episodeNumber}</p>
                <p className="text-xs text-foreground truncate">{ep.title}</p>
                <p className="text-[10px] text-muted">{ep.duration}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
