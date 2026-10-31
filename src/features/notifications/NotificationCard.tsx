'use client';

import { AlertTriangle, ArrowRight, Bell, Clapperboard, Coins, FileText, Film } from 'lucide-react';
import { formatDateTime } from '@/lib/format';
import type { AppNotification } from '@/types/production';

/** Get modern icon and color accent for notification by type / keywords */
function getNotificationMeta(item: AppNotification): {
  icon: React.ElementType;
  colorClass: string;
  badgeLabel: string;
  badgeTone: string;
} {
  const type = item.type?.toUpperCase() ?? '';
  const text = `${item.title} ${item.body ?? ''}`.toLowerCase();

  if (type.includes('TOKEN') || text.includes('token') || text.includes('cấp phí') || text.includes('ngân sách')) {
    return {
      icon: Coins,
      colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
      badgeLabel: 'Ngân sách Token',
      badgeTone: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25',
    };
  }

  if (type.includes('CHANGE') || type.includes('REQUEST') || text.includes('đề xuất') || text.includes('yêu cầu')) {
    return {
      icon: FileText,
      colorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      badgeLabel: 'Yêu cầu & Đề xuất',
      badgeTone: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20',
    };
  }

  if (type.includes('PRICE') || text.includes('giá coin') || text.includes('cảnh báo giá')) {
    return {
      icon: AlertTriangle,
      colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      badgeLabel: 'Cảnh báo giá',
      badgeTone: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
    };
  }

  if (type.includes('MEDIA') || type.includes('FILM') || type.includes('EPISODE') || text.includes('phim') || text.includes('tập')) {
    return {
      icon: Film,
      colorClass: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
      badgeLabel: 'Tập phim & Media',
      badgeTone: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20',
    };
  }

  if (type.includes('STUDIO') || text.includes('studio')) {
    return {
      icon: Clapperboard,
      colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      badgeLabel: 'Studio sản xuất',
      badgeTone: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
    };
  }

  return {
    icon: Bell,
    colorClass: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
    badgeLabel: 'Hệ thống',
    badgeTone: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/20',
  };
}

/** Format relative time */
function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return formatDateTime(isoString);
  } catch {
    return formatDateTime(isoString);
  }
}

interface NotificationCardProps {
  item: AppNotification;
  href: string | null;
  onOpen: () => void;
}

/** One notification in the center: category badge, unread marker, and a link hint when it leads somewhere. */
export function NotificationCard({ item, href, onOpen }: NotificationCardProps) {
  const isUnread = !item.readAt;
  const meta = getNotificationMeta(item);
  const MetaIcon = meta.icon;

  return (
    <div
      onClick={onOpen}
      className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer border ${
        isUnread
          ? 'bg-sky-50/40 dark:bg-sky-500/[0.05] border-sky-200/90 dark:border-sky-500/25 hover:border-sky-300 dark:hover:border-sky-500/40 shadow-xs'
          : 'bg-white dark:bg-white/[0.015] border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-50/70 dark:hover:bg-white/[0.03]'
      }`}
    >
      {/* Unread indicator ribbon */}
      {isUnread && (
        <span className="absolute top-4 left-2 w-1.5 h-8 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50" />
      )}

      <div className="flex items-start gap-4 ml-1">
        {/* Icon avatar */}
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${meta.colorClass}`}
        >
          <MetaIcon className="w-5 h-5" />
        </div>

        {/* Content block */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeTone}`}
              >
                {meta.badgeLabel}
              </span>
              {isUnread && (
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-500/20 px-2 py-0.5 rounded-full">
                  Mới
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
              <span>{formatTimeAgo(item.createdAt)}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            className={`text-sm leading-snug ${
              isUnread
                ? 'font-bold text-slate-900 dark:text-white'
                : 'font-semibold text-slate-700 dark:text-slate-300'
            }`}
          >
            {item.title}
          </h3>

          {/* Body / Detail snippet */}
          {item.body && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              {item.body}
            </p>
          )}

          {/* Footer timestamp and link action */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
              {formatDateTime(item.createdAt)}
            </span>

            {href && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">
                <span>Xem chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
