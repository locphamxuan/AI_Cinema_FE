'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Empty, ErrorNote, Loading, Panel } from '@/features/production/components/shared/ui';
import { Pager } from '@/features/production/components/shared/Pager';
import { useResource } from '@/features/production/hooks/useResource';
import { formatDateTime } from '@/features/production/lib/format';
import { notificationHref } from '@/features/production/lib/routes';
import { notificationService } from '@/services/notificationService';
import { useAppStore } from '@/store/useAppStore';
import type { AppNotification } from '@/types/production';
import { notificationTabsFor, typesOf, type NotificationTab } from './notificationCatalog';

const PAGE_SIZE = 15;
const ALL: NotificationTab = { key: 'all', label: 'Tất cả', description: 'Mọi thông báo, mới nhất trước.', sections: [] };

/** Unread count of each tab, read from the API so it covers every page, not only the one on screen. */
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

/** Every notification of the account, in tabs by who caused it and, inside a tab, by kind of event. */
export function NotificationsPage() {
  const router = useRouter();
  const role = useAppStore((s) => s.user?.role);
  const [tabs] = useState(() => [ALL, ...notificationTabsFor(role)]);
  const [tabKey, setTabKey] = useState('all');
  const [sectionKey, setSectionKey] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const tab = tabs.find((t) => t.key === tabKey) ?? ALL;
  const section = tab.sections.find((s) => s.key === sectionKey);
  const types = section ? section.types : typesOf(tab);
  const counts = useUnreadCounts(tabs, version);
  const list = useResource(`notifications:${tabKey}:${sectionKey}:${unreadOnly}:${page}:${version}`, () =>
    notificationService.listByTypes(types, page, PAGE_SIZE, unreadOnly),
  );

  const rows = list.data?.data ?? [];

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
    await notificationService.markAllRead();
    setVersion((v) => v + 1);
  };

  return (
    <main className="w-full px-6 lg:px-8 py-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Thông báo</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Chia theo người gây ra sự kiện và loại sự kiện để cập nhật kịp thời.</p>
        </div>
        <Button size="sm" variant="secondary" onClick={readAll}>
          <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" /> Đánh dấu đã đọc hết
        </Button>
      </div>

      <div role="tablist" aria-label="Nhóm thông báo" className="flex gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-white/5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === tabKey}
            onClick={() => choose(t.key)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
              t.key === tabKey ? 'bg-white dark:bg-sky-600 text-sky-800 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t.label}
            {(counts[t.key] ?? 0) > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-xs">{counts[t.key]}</span>}
          </button>
        ))}
      </div>

      <Panel
        title={section ? `${tab.label} · ${section.label}` : tab.label}
        description={tab.description}
        actions={
          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" checked={unreadOnly} onChange={(e) => { setUnreadOnly(e.target.checked); setPage(1); }} /> Chỉ chưa đọc
          </label>
        }
      >
        {tab.sections.length > 0 && (
          <div role="group" aria-label="Mục" className="flex flex-wrap gap-1.5 mb-4">
            {[{ key: null, label: 'Tất cả mục' }, ...tab.sections].map((s) => (
              <button
                key={s.key ?? 'all'}
                type="button"
                aria-pressed={sectionKey === s.key}
                onClick={() => choose(tab.key, s.key)}
                className={`px-2.5 py-1 rounded-full text-xs border cursor-pointer ${
                  sectionKey === s.key ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
        {list.error && <ErrorNote message={list.error} onRetry={list.reload} />}
        {list.loading && !list.data && <Loading />}
        {list.data && rows.length === 0 && <Empty>Không có thông báo nào ở mục này.</Empty>}
        <ul className="divide-y divide-slate-100 dark:divide-white/5">
          {rows.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => open(item)} className="w-full text-left py-3 px-1 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer">
                <p className={`text-xs ${item.readAt ? 'text-slate-600 dark:text-slate-400' : 'font-semibold text-slate-900 dark:text-white'}`}>
                  {!item.readAt && <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500 mr-1.5 align-middle" />}
                  {item.title}
                </p>
                {item.body && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.body}</p>}
                <p className="text-xs text-slate-400 mt-1">{formatDateTime(item.createdAt)}</p>
              </button>
            </li>
          ))}
        </ul>
        <Pager page={page} totalPages={list.data?.meta?.totalPages ?? 1} onChange={setPage} />
      </Panel>
    </main>
  );
}