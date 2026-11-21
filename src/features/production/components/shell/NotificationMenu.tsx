'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { useAppStore } from '@/store/useAppStore';
import type { AppNotification } from '@/types/production';
import { formatDateTime } from '@/lib/format';
import { notificationHref } from '../../lib/routes';
import { homeAreaOf } from '@/lib/permissions';

const POLL_MS = 60_000;
/** Notifications the bell lists; the full list is on the notifications page. */
const LATEST_COUNT = 15;

/** In-app notifications of internal accounts (BR-53): unread badge, latest list, open the linked screen. */
export function NotificationMenu() {
  const router = useRouter();
  const role = useAppStore((s) => s.user?.role);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(async () => {
    const res = await notificationService.getUnreadCount();
    if (res.success) setUnread(res.data.unread);
  }, []);

  useEffect(() => {
    // Polls the unread count; setState happens in the async callback, not synchronously.
    const first = setTimeout(() => void refreshCount(), 0);
    const timer = setInterval(() => void refreshCount(), POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [refreshCount]);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      const res = await notificationService.listNotifications(1, LATEST_COUNT);
      setItems(res.success ? res.data.data : []);
    }
  };

  const openItem = async (item: AppNotification) => {
    setOpen(false);
    if (!item.readAt) {
      await notificationService.markRead(item.id);
      void refreshCount();
    }
    const href = notificationHref(item.link, role, item.payload as { projectId?: string; episodeId?: string });
    if (href) router.push(href);
  };

  const readAll = async () => {
    await notificationService.markAllRead();
    setUnread(0);
    setItems((list) => list?.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })) ?? null);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unread ? `Thông báo, ${unread} chưa đọc` : 'Thông báo'}
        aria-expanded={open}
        className="relative w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition cursor-pointer"
      >
        <Bell className="w-4 h-4" aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[70vh] overflow-y-auto rounded-xl bg-card border border-border shadow-lg z-40">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <p className="text-xs font-semibold text-foreground">Thông báo</p>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push(`/${homeAreaOf(role) ?? 'reviewer'}/notifications`);
              }}
              className="text-[11px] font-medium text-muted-foreground hover:text-sky-700 hover:underline cursor-pointer"
            >
              Xem tất cả theo mục
            </button>
            {unread > 0 && (
              <button type="button" onClick={readAll} className="text-[11px] font-medium text-sky-700 dark:text-sky-500 hover:underline cursor-pointer">
                Đánh dấu đã đọc hết
              </button>
            )}
          </div>
          {items === null && <p className="px-4 py-6 text-xs text-muted-foreground text-center">Đang tải…</p>}
          {items?.length === 0 && <p className="px-4 py-6 text-xs text-muted-foreground text-center">Chưa có thông báo.</p>}
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {items?.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openItem(item)}
                  className="w-full text-left px-4 py-2.5 hover:bg-muted/60 transition cursor-pointer"
                >
                  <p className={`text-xs ${item.readAt ? 'text-muted-foreground' : 'font-semibold text-foreground'}`}>
                    {!item.readAt && <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500 mr-1.5 align-middle" />}
                    {item.title}
                  </p>
                  {item.body && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{item.body}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{formatDateTime(item.createdAt)}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
