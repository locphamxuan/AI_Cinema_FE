'use client';

import { NOTIFICATION_TYPE_LABEL } from '@/features/production/lib/labels';
import { formatDateTime } from '@/lib/format';
import type { AppNotification } from '@/types/production';

/** The category badge of a notification, by its type or, for older types, by keywords. */
function getNotificationMeta(item: AppNotification): {
  badgeLabel: string;
  badgeTone: string;
} {
  const type = item.type?.toUpperCase() ?? '';
  const text = `${item.title} ${item.body ?? ''}`.toLowerCase();

  // MF-1 (07/11/2026): idea notes, script, contract and Final Film have their own badge.
  const mf1 = NOTIFICATION_TYPE_LABEL[type];
  if (mf1) {
    return {
      badgeLabel: mf1,
      badgeTone: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20',
    };
  }

  if (type.startsWith('COST_') || text.includes('chi phí') || text.includes('ngân sách')) {
    return {
      badgeLabel: 'Chi phí sản xuất',
      badgeTone: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25',
    };
  }

  if (type.includes('CHANGE') || type.includes('REQUEST') || text.includes('đề xuất') || text.includes('yêu cầu')) {
    return {
      badgeLabel: 'Yêu cầu & Đề xuất',
      badgeTone: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20',
    };
  }

  if (type.includes('PRICE') || text.includes('giá coin') || text.includes('cảnh báo giá')) {
    return {
      badgeLabel: 'Cảnh báo giá',
      badgeTone: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
    };
  }

  if (type.includes('MEDIA') || type.includes('FILM') || type.includes('EPISODE') || text.includes('phim') || text.includes('tập')) {
    return {
      badgeLabel: 'Tập phim & video',
      badgeTone: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20',
    };
  }

  if (type.includes('STUDIO') || text.includes('studio')) {
    return {
      badgeLabel: 'Studio sản xuất',
      badgeTone: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
    };
  }

  return {
    badgeLabel: 'Hệ thống',
    badgeTone: 'bg-slate-50 text-secondary-foreground border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20',
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

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className={`group relative rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 p-4 sm:p-5 transition-all duration-200 cursor-pointer border ${
        isUnread
          ? 'bg-sky-50/40 dark:bg-sky-500/[0.05] border-sky-200/90 dark:border-sky-500/25 hover:border-sky-300 dark:hover:border-sky-500/40 shadow-xs'
          : 'bg-white dark:bg-white/[0.015] border-border hover:border-border hover:bg-slate-50/70 dark:hover:bg-white/[0.03]'
      }`}
    >
      {/* Unread indicator ribbon */}
      {isUnread && (
        <span className="absolute top-4 left-2 w-1.5 h-8 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50" />
      )}

      <div className="flex items-start gap-4 ml-1">

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

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 font-medium">
              <span>{formatTimeAgo(item.createdAt)}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            className={`text-sm leading-snug ${
              isUnread
                ? 'font-bold text-foreground'
                : 'font-semibold text-secondary-foreground'
            }`}
          >
            {item.title}
          </h3>

          {/* Body / Detail snippet */}
          {item.body && (
            <p className="text-xs text-muted-foreground leading-relaxed font-normal">
              {item.body}
            </p>
          )}

          {/* Footer timestamp and link action */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] tabular-nums text-muted-foreground/70">
              {formatDateTime(item.createdAt)}
            </span>

            {href && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">
                <span>Xem chi tiết</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
