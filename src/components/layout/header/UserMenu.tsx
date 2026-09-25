'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { useClickOutside } from './useClickOutside';

const ITEM =
  'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-foreground hover:bg-slate-100 dark:hover:bg-white/10 transition-colors';

const PROFILE_LINKS = [
  { href: '/profile', label: '👤 Hồ sơ cá nhân' },
  { href: '/profile/subscription', label: '👑 Gói dịch vụ hội viên' },
  { href: '/profile/transactions', label: '💳 Lịch sử giao dịch ví' },
  { href: '/profile/history', label: '🕒 Lịch sử xem phim' },
];

/** Avatar button and the member's account menu. */
export default function UserMenu() {
  const { user, isVIPMode, openRightSidebar, logout } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);
  const ref = useClickOutside<HTMLDivElement>(close);
  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-ruby/50 transition-all cursor-pointer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- avatars come from arbitrary hosts */}
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/20 object-cover"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#161922] p-3 shadow-2xl border border-slate-200 dark:border-white/15 rounded-2xl animate-scale-in z-50">
          <div className="pb-3 mb-2 border-b border-slate-100 dark:border-white/10">
            <p className="text-sm font-bold text-slate-900 dark:text-foreground truncate">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-muted-light truncate">{user.email}</p>
            <span
              className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                isVIPMode
                  ? 'bg-coin/20 text-coin border border-coin/30'
                  : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-muted-light'
              }`}
            >
              {isVIPMode ? 'Hội viên VIP' : 'Tài khoản thường'}
            </span>
          </div>

          <div className="space-y-1">
            {PROFILE_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={close} className={ITEM}>
                <span>{link.label}</span>
                <span className="text-slate-400">›</span>
              </Link>
            ))}
            <button
              onClick={() => {
                close();
                openRightSidebar();
              }}
              className={`${ITEM} w-full cursor-pointer text-left`}
            >
              <span>⚙️ Bảng điều khiển Sidebar</span>
              <span className="text-slate-400">›</span>
            </button>
          </div>

          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-white/10">
            <button
              onClick={() => {
                close();
                logout();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-ruby hover:bg-ruby/15 transition-colors cursor-pointer"
            >
              <span>Đăng xuất</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
