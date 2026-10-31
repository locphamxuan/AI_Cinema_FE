'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { episodeAccessService } from '@/services/episodeAccessService';
import type { MySubscription } from '@/types/episodeAccess';
import { ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  const { user, wallet, openDepositModal } = useAppStore();
  const [plan, setPlan] = useState<MySubscription | null>(null);

  useEffect(() => {
    if (!user) return;
    episodeAccessService
      .getMySubscription()
      .then((res) => setPlan(res.success && res.data?.status !== 'PENDING' ? res.data : null))
      .catch(() => setPlan(null));
  }, [user]);
  const isMember = plan !== null;

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bạn chưa đăng nhập</h2>
        <p className="text-sm text-slate-500 dark:text-muted-light">Vui lòng đăng nhập để xem thông tin hồ sơ.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12 px-4 sm:px-0">
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
              <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">{user.name}</h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black ${
                  isMember
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                    : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-muted-light'
                }`}
              >
                {isMember ? ` ${plan.plan.name}` : 'Gói Thường'}
              </span>
            </div>

            <p className="text-sm text-slate-500 dark:text-muted-light tabular-nums">{user.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              <Link
                href="/profile/subscription"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-bold transition-all border border-slate-300 dark:border-white/20"
              >
                {isMember ? 'Quản lý gói Tháng' : 'Đăng ký gói Tháng'}
              </Link>

              <button
                type="button"
                onClick={openDepositModal}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                Nạp Coin Vào Ví
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-md">
          <p className="text-xs font-bold text-slate-400 dark:text-muted-light">Số Dư Main Coin</p>
          <p className="text-3xl font-black text-amber-500 tabular-nums mt-1">{wallet.mainCoin.toLocaleString('vi-VN')}</p>
          <p className="text-xs text-slate-500 dark:text-muted-light mt-1">Từ nạp tiền, trừ trước khi mở khóa</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-md">
          <p className="text-xs font-bold text-slate-400 dark:text-muted-light">Coin Thưởng</p>
          <p className="text-3xl font-black text-purple-500 tabular-nums mt-1">+{wallet.bonusCoin.toLocaleString('vi-VN')}</p>
          <p className="text-xs text-slate-500 dark:text-muted-light mt-1">Tặng từ điểm danh & vòng quay</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-md">
          <p className="text-xs font-bold text-slate-400 dark:text-muted-light">Trạng Thái Gói</p>
          <p className="text-xl font-black text-ruby mt-1">{isMember ? plan.plan.name : 'Gói Thường'}</p>
          <p className="text-xs text-slate-500 dark:text-muted-light mt-1">
            {isMember ? `Hiệu lực đến ${new Date(plan.currentPeriodEnd).toLocaleDateString('vi-VN')}` : 'Xem tập miễn phí, mở khóa tập bằng Coin'}
          </p>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white">Lối Tắt Quản Lý Tài Khoản</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. Saved Movies */}
          <Link
            href="/profile/saved"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Phim đã lưu</p>
                <p className="text-xs text-slate-500 dark:text-muted-light">Danh sách phim xem sau của bạn</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* 2. Watch History */}
          <Link
            href="/profile/history"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Lịch sử xem phim</p>
                <p className="text-xs text-slate-500 dark:text-muted-light">Tiến trình các tập phim đã theo dõi</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* 3. Devices */}
          <Link
            href="/profile/devices"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Quản lý thiết bị</p>
                <p className="text-xs text-slate-500 dark:text-muted-light">Kiểm soát các máy đăng nhập & luồng xem</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* 4. Purchased Episodes */}
          <Link
            href="/profile/library"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Kho tập phim đã mua</p>
                <p className="text-xs text-slate-500 dark:text-muted-light">Tập phim mở khóa vĩnh viễn bằng Coin</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* 5. Subscription Plan */}
          <Link
            href="/profile/subscription"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Quản lý gói Tháng</p>
                <p className="text-xs text-slate-500 dark:text-muted-light">Xem chi tiết quyền lợi & gia hạn</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* 6. Coin Transactions */}
          <Link
            href="/profile/transactions"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Lịch sử giao dịch ví</p>
                <p className="text-xs text-slate-500 dark:text-muted-light">Xem biến động số dư sổ cái Coin</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
