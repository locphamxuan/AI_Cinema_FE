'use client';

import { ExternalLink } from 'lucide-react';
import type { AppNotification } from '@/types/production';

/** BE notification links are API-side paths; these are the member pages that show the same thing. */
const MEMBER_ROUTES: Record<string, string> = {
  '/membership': '/profile/subscription',
  '/wallet': '/profile/transactions',
};

export function memberHref(link: string | null): string | null {
  if (!link) return null;
  return MEMBER_ROUTES[link] ?? (link.startsWith('/') ? link : null);
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Gần đây';
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60_000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay === 1) return 'Hôm qua';
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function iconOf(type: string): string {
  if (type.includes('COIN')) return '🪙';
  if (type.includes('SUB')) return '👑';
  if (type.includes('EPISODE') || type.includes('MEDIA') || type.includes('CONTENT')) return '🎬';
  return '🔔';
}

export function GuestNotice({ onLogin }: Readonly<{ onLogin: () => void }>) {
  return (
    <div className="p-6 text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center text-xl mx-auto shadow-inner">
        🔔
      </div>
      <div>
        <h4 className="font-bold text-white text-sm">Đăng nhập để xem thông báo</h4>
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
          Nhận thông báo về tập phim mới, biến động ví Coin và gói Tháng của bạn.
        </p>
      </div>
      <button
        type="button"
        onClick={onLogin}
        className="mt-2 py-2.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer"
      >
        Đăng Nhập Ngay
      </button>
    </div>
  );
}

interface NotificationListProps {
  items: AppNotification[];
  loading: boolean;
  onOpen: (item: AppNotification) => void;
}

export function NotificationList({ items, loading, onOpen }: Readonly<NotificationListProps>) {
  if (loading && items.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[11px]">Đang tải thông báo...</p>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 space-y-2">
        <span className="text-3xl block">📭</span>
        <p className="font-bold text-slate-300 text-xs">Chưa có thông báo nào mới</p>
        <p className="text-[10px] text-slate-500 max-w-xs mx-auto">Các cập nhật về phim mới, Coin nạp và quà điểm danh sẽ hiển thị tại đây.</p>
      </div>
    );
  }
  return (
    <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
      {items.map((item) => {
        const isUnread = !item.readAt;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item)}
            className={`w-full p-3.5 text-left transition-all flex items-start gap-3 cursor-pointer ${
              isUnread ? 'bg-slate-800/40 hover:bg-slate-800/70 border-l-2 border-purple-500' : 'hover:bg-slate-800/30 text-slate-300'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0 mt-0.5 text-sm">
              {iconOf(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <p className={`truncate text-xs ${isUnread ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>{item.title}</p>
                {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />}
              </div>
              {item.body && <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-1">{item.body}</p>}
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>{formatRelativeTime(item.createdAt)}</span>
                {item.link && (
                  <span className="flex items-center gap-0.5 text-purple-400 hover:text-purple-300 font-semibold">
                    <span>Chi tiết</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
