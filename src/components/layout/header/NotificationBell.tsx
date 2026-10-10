'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Film, Coins, Crown, Sparkles, ExternalLink } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { useAppStore } from '@/store/useAppStore';
import type { AppNotification } from '@/types/production';

interface NotificationBellProps {
  className?: string;
  isScrolled?: boolean;
}

function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay === 1) return 'Hôm qua';
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  } catch {
    return 'Gần đây';
  }
}

function getNotificationIcon(type: string) {
  if (type.includes('COIN')) {
    return <span className="text-amber-400 text-sm">🪙</span>;
  }
  if (type.includes('SUB')) {
    return <span className="text-purple-400 text-sm">👑</span>;
  }
  if (type.includes('EPISODE') || type.includes('MEDIA') || type.includes('CONTENT')) {
    return <span className="text-rose-400 text-sm">🎬</span>;
  }
  return <span className="text-indigo-400 text-sm">🔔</span>;
}

export default function NotificationBell({ className = '', isScrolled = false }: NotificationBellProps) {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll unread count if authenticated
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await notificationService.getUnreadCount();
      if (res.success && res.data) {
        setUnreadCount(res.data.unread);
      }
    } catch {
      // Ignore background poll errors
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnreadCount();
    const timer = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(timer);
  }, [fetchUnreadCount]);

  // Load notifications list when opened
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;

    let isMounted = true;
    setIsLoading(true);

    notificationService
      .listNotifications(1, 15)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data?.data) {
          setNotifications(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, isAuthenticated]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      );
    } catch {
      // Ignore
    }
  };

  const handleItemClick = async (item: AppNotification) => {
    setIsOpen(false);
    if (!item.readAt) {
      try {
        await notificationService.markRead(item.id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n))
        );
      } catch {
        // Ignore
      }
    }

    if (item.link) {
      router.push(item.link);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button (matches user uploaded image) */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={unreadCount > 0 ? `Thông báo, ${unreadCount} chưa đọc` : 'Thông báo'}
        aria-expanded={isOpen}
        title="Thông báo"
        className={`relative w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
          isScrolled
            ? 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200'
            : 'bg-white/10 hover:bg-white/20 text-white'
        } ${className}`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E50914] ring-2 ring-slate-900 animate-pulse" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-scale-in text-white text-xs">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-white">Thông Báo</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {isAuthenticated && unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đã đọc tất cả</span>
              </button>
            )}
          </div>

          {/* Body */}
          {!isAuthenticated ? (
            /* Guest State */
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center text-xl mx-auto shadow-inner">
                🔔
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Đăng nhập để xem thông báo</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Nhận thông báo độc quyền về tập phim AI mới, biến động ví Coin và ưu đãi đặc quyền VIP.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  openAuthModal('login');
                }}
                className="mt-2 py-2.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer"
              >
                Đăng Nhập Ngay
              </button>
            </div>
          ) : isLoading && notifications.length === 0 ? (
            /* Loading State */
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[11px]">Đang tải thông báo...</p>
            </div>
          ) : notifications.length === 0 ? (
            /* Empty State */
            <div className="py-12 text-center text-slate-400 space-y-2">
              <span className="text-3xl block">📭</span>
              <p className="font-bold text-slate-300 text-xs">Chưa có thông báo nào mới</p>
              <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                Các cập nhật về phim mới, Coin nạp và quà điểm danh sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            /* Notification List */
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
              {notifications.map((item) => {
                const isUnread = !item.readAt;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={`w-full p-3.5 text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isUnread
                        ? 'bg-slate-800/40 hover:bg-slate-800/70 border-l-2 border-purple-500'
                        : 'hover:bg-slate-800/30 text-slate-300'
                    }`}
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0 mt-0.5">
                      {getNotificationIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p
                          className={`truncate text-xs ${
                            isUnread ? 'font-bold text-white' : 'font-medium text-slate-300'
                          }`}
                        >
                          {item.title}
                        </p>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                        )}
                      </div>

                      {item.body && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-1">
                          {item.body}
                        </p>
                      )}

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
          )}

          {/* Footer */}
          {isAuthenticated && (
            <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/60 text-center text-[10px] text-slate-500">
              Thông báo tài khoản AI Cinema
            </div>
          )}
        </div>
      )}
    </div>
  );
}
