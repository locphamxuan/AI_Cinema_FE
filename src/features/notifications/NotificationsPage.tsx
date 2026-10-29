'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  Coins,
  Clapperboard,
  FileText,
  AlertTriangle,
  ArrowRight,
  Clock,
  ExternalLink,
  Film,
  CheckCircle2,
  XCircle,
  Inbox,
  Filter,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Empty, ErrorNote, Loading } from '@/features/production/components/shared/ui';
import { Pager } from '@/features/production/components/shared/Pager';
import { useResource } from '@/features/production/hooks/useResource';
import { formatDateTime } from '@/features/production/lib/format';
import { notificationHref } from '@/features/production/lib/routes';
import { notificationService } from '@/services/notificationService';
import { useAppStore } from '@/store/useAppStore';
import type { AppNotification } from '@/types/production';
import { notificationTabsFor, typesOf, type NotificationTab } from './notificationCatalog';

const PAGE_SIZE = 15;
const ALL: NotificationTab = {
  key: 'all',
  label: 'Tất cả thông báo',
  description: 'Toàn bộ sự kiện hệ thống, sắp xếp theo thời gian mới nhất.',
  sections: [],
};

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
      colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      badgeLabel: 'Ngân sách Token',
      badgeTone: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
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

/** Format relative time or clean date string */
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

/** Unread count of each tab, read from the API */
function useUnreadCounts(tabs: NotificationTab[], version: number) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    let active = true;
    void Promise.all(
      tabs.map(async (tab) => {
        const res = await notificationService.listByTypes(typesOf(tab), 1, 1, true);
        return [tab.key, res.success ? res.data.meta.totalItems : 0] as const;
      }),
    ).then((pairs) => active && setCounts(Object.fromEntries(pairs)));
    return () => {
      active = false;
    };
  }, [tabs, version]);
  return counts;
}

/**
 * Modern High-Fidelity Notification Center
 * Redesigned into responsive cards with distinct color accents, category tags, action shortcuts, and time-ago badges.
 */
export function NotificationsPage() {
  const router = useRouter();
  const role = useAppStore((s) => s.user?.role);
  const [tabs] = useState(() => [ALL, ...notificationTabsFor(role)]);
  const [tabKey, setTabKey] = useState('all');
  const [sectionKey, setSectionKey] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);

  const tab = tabs.find((t) => t.key === tabKey) ?? ALL;
  const section = tab.sections.find((s) => s.key === sectionKey);
  const types = section ? section.types : typesOf(tab);
  const counts = useUnreadCounts(tabs, version);

  const list = useResource(`notifications:${tabKey}:${sectionKey}:${unreadOnly}:${page}:${version}`, () =>
    notificationService.listByTypes(types, page, PAGE_SIZE, unreadOnly),
  );

  const rows = list.data?.data ?? [];
  const totalItems = list.data?.meta?.totalItems ?? 0;
  const totalUnreadAll = counts['all'] ?? 0;

  const choose = (next: string, nextSection: string | null = null) => {
    setTabKey(next);
    setSectionKey(nextSection);
    setPage(1);
  };

  const open = async (item: AppNotification) => {
    if (!item.readAt) await notificationService.markRead(item.id);
    const href = notificationHref(item.link, role);
    if (href) router.push(href);
    else setVersion((v) => v + 1);
  };

  const readAll = async () => {
    setMarkingAll(true);
    await notificationService.markAllRead();
    setMarkingAll(false);
    setVersion((v) => v + 1);
  };

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* ── Header Hero Bar ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold">
              <Bell className="w-3.5 h-3.5" />
              <span>Trung tâm thông báo</span>
              {totalUnreadAll > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Thông báo hệ thống
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Theo dõi kịp thời mọi biến động về cấp ngân sách Token, phê duyệt đề xuất, tiến độ gửi phim từ Studio và cảnh báo nền tảng.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              disabled={markingAll || totalUnreadAll === 0}
              onClick={readAll}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer border border-slate-200 dark:border-white/10"
            >
              <CheckCheck className="w-4 h-4 text-emerald-500 mr-1.5" aria-hidden="true" />
              <span>{markingAll ? 'Đang cập nhật…' : 'Đánh dấu đã đọc hết'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main Filter Bar & Tabs ── */}
      <div className="space-y-3">
        {/* Category Tabs */}
        <div
          role="tablist"
          aria-label="Nhóm thông báo"
          className="flex gap-2 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/5 overflow-x-auto"
        >
          {tabs.map((t) => {
            const isActive = t.key === tabKey;
            const unreadCount = counts[t.key] ?? 0;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => choose(t.key)}
                className={`flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-sky-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-transparent'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <span>{t.label}</span>
                {unreadCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider ${
                      isActive
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sub-sections Pills (If current tab has multiple sections) */}
        {tab.sections.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-1 pt-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
              Lọc theo mục:
            </span>
            <button
              type="button"
              onClick={() => choose(tab.key, null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                sectionKey === null
                  ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400'
                  : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              Tất cả mục
            </button>
            {tab.sections.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => choose(tab.key, s.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                  sectionKey === s.key
                    ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Notification Content Container ── */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#141720] shadow-sm overflow-hidden">
        {/* Table Top Status Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-white/[0.01]">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {section ? `${tab.label} · ${section.label}` : tab.label}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {tab.description} {totalItems > 0 && `(Tổng cộng ${totalItems} thông báo)`}
            </p>
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none bg-white dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 transition-colors">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => {
                setUnreadOnly(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 rounded border-slate-300 dark:border-white/20 accent-sky-500 cursor-pointer"
            />
            <span>Chỉ xem chưa đọc</span>
          </label>
        </div>

        {/* Body Items List */}
        <div className="p-4 sm:p-6">
          {list.error && <ErrorNote message={list.error} onRetry={list.reload} />}

          {list.loading && !list.data && (
            <div className="py-16 text-center">
              <Loading />
            </div>
          )}

          {list.data && rows.length === 0 && (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                <Inbox className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Không có thông báo nào ở mục này
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                Khi có hoạt động mới phát sinh về dự án hoặc giao dịch, các sự kiện sẽ hiển thị ngay tại đây.
              </p>
            </div>
          )}

          {rows.length > 0 && (
            <div className="space-y-2.5">
              {rows.map((item) => {
                const isUnread = !item.readAt;
                const meta = getNotificationMeta(item);
                const MetaIcon = meta.icon;
                const href = notificationHref(item.link, role);

                return (
                  <div
                    key={item.id}
                    onClick={() => open(item)}
                    className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer border ${
                      isUnread
                        ? 'bg-sky-50/30 dark:bg-sky-500/[0.04] border-sky-200/80 dark:border-sky-500/20 hover:border-sky-300 dark:hover:border-sky-500/40 shadow-xs'
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
                            <Clock className="w-3 h-3" />
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
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
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
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="pt-6 border-t border-slate-100 dark:border-white/5 mt-6">
            <Pager
              page={page}
              totalPages={list.data?.meta?.totalPages ?? 1}
              onChange={setPage}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
