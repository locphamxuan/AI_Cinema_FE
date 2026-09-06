'use client';

import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';
import LandingHero from '@/components/landing/LandingHero';

export default function HomePage() {
  const {
    isAuthenticated,
    wallet,
    isVIPMode,
    user,
    currentMovie,
    toggleVIPMode,
    setWalletBalance,
    logout,
  } = useAppStore();

  // If not logged in -> Show Netflix-style Landing Page
  if (!isAuthenticated) {
    return <LandingHero />;
  }

  // If logged in -> Show Full Dashboard with Movie Player teaser and Demo Panel
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        <img
          src={currentMovie.bannerUrl}
          alt={currentMovie.title}
          className="w-full h-[320px] sm:h-[420px] object-cover"
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
              🤖 100% AI • Chuẩn Điều 44
            </span>
            {isVIPMode && (
              <span className="px-2 py-0.5 rounded bg-coin/20 text-coin text-xs font-bold">
                👑 Quyền VIP
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-2">
            {currentMovie.title}
          </h1>
          <p className="text-muted-light text-sm sm:text-base max-w-xl line-clamp-2 mb-5">
            {currentMovie.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/watch/ep-001"
              className="px-6 py-3 bg-gradient-to-r from-ruby to-ruby-dark text-white rounded-xl font-bold hover:shadow-lg hover:shadow-ruby/30 transition-all active:scale-95 flex items-center gap-2"
            >
              <span>▶</span>
              <span>Xem ngay</span>
            </Link>
            <Link
              href="/profile/subscription"
              className="px-6 py-3 glass-card-sm text-foreground font-bold hover:bg-card-hover transition-all flex items-center gap-2"
            >
              <span>👑</span>
              <span>Quản lý gói</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Demo Control Panel */}
      <div className="glass-card p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎮</span>
            <div>
              <h2 className="text-lg font-bold text-foreground">Bảng Điều Khiển Demo & Kiểm Thử</h2>
              <p className="text-xs text-muted-light">
                Chuyển đổi trạng thái nhanh để test các luồng nghiệp vụ
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-lg bg-ruby/15 text-ruby text-xs font-bold hover:bg-ruby/25 transition-colors flex items-center gap-1.5"
          >
            <span>🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* User Info Card */}
          <div className="glass-card-sm p-4">
            <p className="text-[10px] text-muted-light uppercase tracking-wider mb-2">Người dùng hiện tại</p>
            <div className="flex items-center gap-3">
              <img
                src={user?.avatarUrl}
                alt={user?.name || 'User'}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/10 object-cover"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
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
              {isVIPMode ? '👑 VIP (Bấm để chuyển Thường)' : '👤 Thường (Bấm bật VIP)'}
            </button>
            <p className="text-[10px] text-muted mt-2">
              {isVIPMode
                ? 'VIP: Xem phim không cần trừ coin'
                : 'Thường: Mua tập khóa phân rã Coin'}
            </p>
          </div>

          {/* Wallet Control */}
          <div className="glass-card-sm p-4">
            <p className="text-[10px] text-muted-light uppercase tracking-wider mb-2">Số dư ví kép</p>
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
              Truy cập luồng nhanh
            </p>
            <div className="space-y-2">
              <Link
                href="/watch/ep-002"
                className="block w-full py-1.5 rounded-lg bg-ruby/20 text-ruby text-xs font-medium text-center hover:bg-ruby/30 transition-colors"
              >
                🔒 Xem tập phim khóa (Tập 2)
              </Link>
              <Link
                href="/profile/transactions"
                className="block w-full py-1.5 rounded-lg bg-neon/20 text-neon text-xs font-medium text-center hover:bg-neon/30 transition-colors"
              >
                📋 Lịch sử giao dịch sao kê
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">📺 Danh Sách Tập Phim</h2>
            <p className="text-xs text-muted-light">Chọn tập để bắt đầu xem và trải nghiệm player HLS</p>
          </div>
          <Link
            href="/watch/ep-001"
            className="text-xs font-medium text-neon hover:text-neon-dark transition-colors"
          >
            Xem player đầy đủ →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {currentMovie.episodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/watch/${ep.id}`}
              className="group glass-card-sm overflow-hidden hover:scale-[1.03] transition-transform border border-white/5"
            >
              <div className="relative aspect-video">
                <img
                  src={ep.thumbnailUrl}
                  alt={ep.title}
                  className="w-full h-full object-cover"
                />
                {!ep.isFree && !ep.isUnlocked && !isVIPMode && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-2xl">🔒</span>
                  </div>
                )}
                {ep.isFree && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-verified/90 text-white text-[9px] font-bold">
                    FREE
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs text-ruby font-bold">Tập {ep.episodeNumber}</p>
                <p className="text-xs text-foreground truncate font-medium">{ep.title}</p>
                <div className="flex items-center justify-between mt-1 text-[10px] text-muted">
                  <span>{ep.duration}</span>
                  {!ep.isFree && !ep.isUnlocked && !isVIPMode && (
                    <span className="text-coin font-bold">🪙 {ep.price}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
