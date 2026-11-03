'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck } from 'lucide-react';
import { GuestNotice, memberHref, NotificationList } from './NotificationList';
import { notificationService } from '@/services/notificationService';
import { useAppStore } from '@/store/useAppStore';
import type { AppNotification } from '@/types/production';

interface NotificationBellProps {
  className?: string;
  isScrolled?: boolean;
}

export default function NotificationBell({ className = '', isScrolled = false }: NotificationBellProps) {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [polledUnread, setUnreadCount] = useState(0);
  const unreadCount = isAuthenticated ? polledUnread : 0;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll unread count if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const poll = () =>
      notificationService
        .getUnreadCount()
        .then((res) => {
          if (res.success && res.data) setUnreadCount(res.data.unread);
        })
        .catch(() => undefined);
    void poll();
    const timer = setInterval(() => void poll(), 30_000);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  // Load notifications list when opened
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;

    let isMounted = true;
    notificationService
      .listNotifications(1, 15)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data?.data) {
          setNotifications(res.data.data);
        }
      })
      .catch(() => undefined)
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
    if (!isOpen) setIsLoading(true);
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

    const href = memberHref(item.link);
    if (href) router.push(href);
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
                onClick={() => void handleMarkAllRead()}
                className="text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đã đọc tất cả</span>
              </button>
            )}
          </div>

          {isAuthenticated ? (
            <NotificationList items={notifications} loading={isLoading} onOpen={(item) => void handleItemClick(item)} />
          ) : (
            <GuestNotice
              onLogin={() => {
                setIsOpen(false);
                openAuthModal('login');
              }}
            />
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
