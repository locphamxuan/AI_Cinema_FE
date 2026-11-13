'use client';

import { useState } from 'react';
import { Headphones, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import { useResource } from '@/hooks/useResource';
import { useAppStore } from '@/store/useAppStore';
import { formatDateTime } from '@/lib/format';
import { staffSupportService } from '@/services/staffSupportService';
import { Pager } from '@/components/data/Pager';
import { Empty, Loading } from '@/components/data/ui';
import type { SupportConversation } from '@/types/support';
import { StaffCaseChat } from './StaffCaseChat';

const STATUS_FILTERS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'WAITING_FOR_STAFF', label: 'Chờ nhân viên' },
  { key: 'STAFF_HANDLING', label: 'Đang xử lý' },
  { key: 'RESOLVED', label: 'Đã giải quyết' },
];

export function StaffSupportWorkspace({ isAdmin = false }: { isAdmin?: boolean }) {
  const currentUser = useAppStore((s) => s.user);
  const [filter, setFilter] = useState('WAITING_FOR_STAFF');
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);

  const stats = useResource('staff:support:stats', staffSupportService.getStats);
  const queue = useResource(
    `staff:support:queue:${filter}:${page}`,
    () => staffSupportService.listQueue(page, 15, filter === 'ALL' ? undefined : filter),
  );
  const detail = useResource(activeId ? `staff:support:detail:${activeId}` : null, () => staffSupportService.getDetail(activeId!));

  const items: SupportConversation[] = queue.data?.data ?? [];
  const meta = queue.data?.meta;

  const refreshAll = async () => {
    await Promise.all([queue.reload(), stats.reload(), detail.reload()]);
  };

  return (
    <div className="space-y-4">
      {/* ── Metric cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111420] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Chờ nhân viên nhận</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {stats.data?.waitingCount ?? 0}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111420] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Đang xử lý</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {stats.data?.handlingCount ?? 0}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111420] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Đã giải quyết hôm nay</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {stats.data?.resolvedTodayCount ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Workspace: Queue List & Active Chat ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Queue list */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111420] overflow-hidden flex flex-col h-[650px] shadow-xs">
          <div className="p-3 border-b border-slate-100 dark:border-white/5 space-y-2 bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="flex gap-1 overflow-x-auto text-xs">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    setFilter(f.key);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    filter === f.key
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {queue.loading && !queue.data && <Loading />}
            {items.length === 0 && !queue.loading && (
              <Empty>Không có ca hỗ trợ nào trong danh mục này.</Empty>
            )}
            {items.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveId(item.id)}
                onKeyDown={(e) => e.key === 'Enter' && setActiveId(item.id)}
                className={`p-3.5 text-left transition-colors cursor-pointer text-xs space-y-1.5 ${
                  activeId === item.id
                    ? 'bg-sky-50/70 dark:bg-sky-500/10 border-l-4 border-l-sky-500'
                    : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-white truncate">
                    #{item.id.slice(0, 8)} · {item.member?.fullName || item.member?.email || 'Member'}
                  </span>
                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                    {item.status}
                  </span>
                </div>
                {item.escalationReason && (
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-1 text-[11px]">
                    Lý do: {item.escalationReason}
                  </p>
                )}
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{item.assignedStaff ? `Phụ trách: ${item.assignedStaff.fullName}` : 'Chưa nhận'}</span>
                  <span>{formatDateTime(item.lastMessageAt || item.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="p-2 border-t border-slate-100 dark:border-white/5">
              <Pager page={page} totalPages={meta.totalPages} onChange={setPage} />
            </div>
          )}
        </div>

        {/* Right: Active Chat */}
        <div className="lg:col-span-7">
          {activeId && detail.data ? (
            <StaffCaseChat
              detail={detail.data}
              currentUserId={currentUser?.id}
              isAdmin={isAdmin}
              onRefresh={refreshAll}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[650px] rounded-3xl border border-dashed border-slate-200 dark:border-white/10 text-slate-400 text-xs p-6 text-center">
              <MessageSquare className="w-10 h-10 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">Chọn một ca hỗ trợ để xử lý</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Danh sách bên trái hiển thị các yêu cầu CSKH chờ tiếp nhận hoặc đang xử lý.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
