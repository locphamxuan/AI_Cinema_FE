'use client';

import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isVIPMode, wallet, subscription, toggleVIPMode, openDepositModal } = useAppStore();

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bạn chưa đăng nhập</h2>
        <p className="text-sm text-slate-500 dark:text-muted-light">Vui lòng đăng nhập để xem thông tin hồ sơ.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header Profile Card */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 p-6 opacity-10 font-black text-8xl select-none pointer-events-none text-ruby">
          VIP
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-ruby shadow-2xl object-cover"
          />

          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{user.name}</h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  isVIPMode
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                    : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-muted-light'
                }`}
              >
                {isVIPMode ? '👑 Hội Viên VIP' : 'FREE TIER'}
              </span>
            </div>

            <p className="text-sm text-slate-500 dark:text-muted-light font-mono">{user.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              <button
                onClick={toggleVIPMode}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-bold transition-all cursor-pointer border border-slate-300 dark:border-white/20"
              >
                {isVIPMode ? '⚡ Chuyển sang Tài khoản thường (Demo)' : '👑 Nâng cấp lên VIP Pass'}
              </button>

              <button
                onClick={openDepositModal}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-md cursor-pointer"
              >
                💰 Nạp Coin Vào Ví
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-md">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-muted-light">Số Dư Main Coin</p>
          <p className="text-3xl font-black text-amber-500 font-mono mt-1">{wallet.mainCoin}</p>
          <p className="text-xs text-slate-500 dark:text-muted-light mt-1">Dùng mở khóa phim 4K</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-md">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-muted-light">Coin Thưởng</p>
          <p className="text-3xl font-black text-purple-500 font-mono mt-1">+{wallet.bonusCoin}</p>
          <p className="text-xs text-slate-500 dark:text-muted-light mt-1">Tặng từ điểm danh hàng ngày</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-md">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-muted-light">Trạng Thái Gói</p>
          <p className="text-xl font-black text-ruby mt-1">{isVIPMode ? 'VIP 4K Unlimited' : 'Tài Khoản Thường'}</p>
          <p className="text-xs text-slate-500 dark:text-muted-light mt-1">Hạn dùng: {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('vi-VN') : 'Không giới hạn'}</p>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Lối Tắt Quản Lý Account</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/profile/subscription"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Quản lý Gói hội viên VIP</p>
                <p className="text-xs text-slate-500 dark:text-muted-light">Xem chi tiết quyền lợi & gia hạn</p>
              </div>
            </div>
            <span className="text-slate-400">›</span>
          </Link>

          <Link
            href="/profile/transactions"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Lịch sử giao dịch ví</p>
                <p className="text-xs text-slate-500 dark:text-muted-light">Xem lịch sử nạp coin, mua tập phim</p>
              </div>
            </div>
            <span className="text-slate-400">›</span>
          </Link>

          <Link
            href="/profile/history"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🕒</span>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Lịch sử xem phim</p>
                <p className="text-xs text-slate-500 dark:text-muted-light">Xem lại các phim & tập đã theo dõi</p>
              </div>
            </div>
            <span className="text-slate-400">›</span>
          </Link>

          <button
            onClick={openDepositModal}
            className="p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-between transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">Nạp Coin Vào Ví AI</p>
                <p className="text-xs text-slate-500 dark:text-muted-light">Nhận ưu đãi bonus nạp coin</p>
              </div>
            </div>
            <span className="text-amber-500">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
