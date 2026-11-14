'use client';

import { useMemo, useState } from 'react';
import { Headphones, Clock, CheckCircle2, Search, RotateCw, AlertCircle, X } from 'lucide-react';
import { useResource } from '@/hooks/useResource';
import { useAppStore } from '@/store/useAppStore';
import { formatDateTime } from '@/lib/format';
import { staffSupportService } from '@/services/staffSupportService';
import { Pager } from '@/components/data/Pager';
import { Loading } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import type { SupportConversation } from '@/types/support';
import { StaffCaseChat } from './StaffCaseChat';
import { SupportDeskPlaceholder } from './SupportDeskPlaceholder';

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
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const stats = useResource('staff:support:stats', staffSupportService.getStats);
  const queue = useResource(
    `staff:support:queue:${filter}:${page}`,
    () => staffSupportService.listQueue(page, 20, filter === 'ALL' ? undefined : filter),
  );
  const detail = useResource(
    activeId ? `staff:support:detail:${activeId}` : null,
    () => staffSupportService.getDetail(activeId!),
  );

  const rawItems: SupportConversation[] = queue.data?.data ?? [];
  const meta = queue.data?.meta;

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rawItems;
    return rawItems.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.member?.fullName?.toLowerCase().includes(q) ||
        item.member?.email?.toLowerCase().includes(q) ||
        item.escalationReason?.toLowerCase().includes(q),
    );
  }, [rawItems, search]);

  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.all([queue.reload(), stats.reload(), detail.reload()]);
    setRefreshing(false);
  };

  const waitingCount = stats.data?.waitingCount ?? 0;
  const handlingCount = stats.data?.handlingCount ?? 0;
  const resolvedCount = stats.data?.resolvedTodayCount ?? 0;

  return (
    <div className="space-y-6">
      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 sm:p-6 rounded-2xl border border-amber-200/60 dark:border-amber-500/20 bg-gradient-to-br from-amber-50/50 via-white to-white dark:from-amber-500/5 dark:via-[#111420] dark:to-[#111420] shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Chờ nhân viên nhận
              </p>
              {waitingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {waitingCount}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl border border-sky-200/60 dark:border-sky-500/20 bg-gradient-to-br from-sky-50/50 via-white to-white dark:from-sky-500/5 dark:via-[#111420] dark:to-[#111420] shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
              Đang trong phiên xử lý
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {handlingCount}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl border border-emerald-200/60 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50/50 via-white to-white dark:from-emerald-500/5 dark:via-[#111420] dark:to-[#111420] shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Đã giải quyết hôm nay
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {resolvedCount}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── Main Workspace: Queue & Active Desk ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Support Queue List */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111420] overflow-hidden flex flex-col h-[700px] shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-white/5 space-y-3 bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Hàng đợi hỗ trợ ({meta?.totalItems ?? rawItems.length})
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={refreshAll}
                disabled={refreshing}
                className="h-7 px-2 text-xs gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã ca, tên thành viên..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto text-xs pb-0.5">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    setFilter(f.key);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                    filter === f.key
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-xs'
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
            {filteredItems.length === 0 && !queue.loading && (
              <div className="p-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Không có ca hỗ trợ nào trong danh mục này
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Khi khách hàng gửi yêu cầu hỗ trợ qua AI Chatbox, các ca cần xử lý sẽ xuất hiện tại đây.
                </p>
              </div>
            )}

            {filteredItems.map((item) => {
              const isSelected = activeId === item.id;
              const memberName = item.member?.fullName || item.member?.email || 'Thành viên ẩn danh';

              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveId(item.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveId(item.id)}
                  className={`p-4 text-left transition-all cursor-pointer text-xs space-y-2 border-l-4 ${
                    isSelected
                      ? 'bg-sky-50/80 dark:bg-sky-500/10 border-l-sky-500 shadow-xs'
                      : 'border-l-transparent hover:bg-slate-50/70 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 text-[10px] font-bold">
                        {memberName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {memberName}
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                      #{item.id.slice(0, 6)}
                    </span>
                  </div>

                  {item.escalationReason && (
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2 text-[11px] bg-slate-50 dark:bg-white/[0.02] p-1.5 rounded-md border border-slate-100 dark:border-white/5">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Lý do: </span>
                      {item.escalationReason}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      {item.assignedStaff ? `👤 ${item.assignedStaff.fullName}` : 'Chưa tiếp nhận'}
                    </span>
                    <span>{formatDateTime(item.lastMessageAt || item.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="p-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
              <Pager page={page} totalPages={meta.totalPages} onChange={setPage} />
            </div>
          )}
        </div>

        {/* Right: Operations Desk or Live Support Chat */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111420] overflow-hidden flex flex-col h-[700px] shadow-xs">
          {detail.loading && <Loading />}

          {!detail.loading && detail.data && (
            <StaffCaseChat
              detail={detail.data}
              currentUserId={currentUser?.id}
              isAdmin={isAdmin}
              onRefresh={refreshAll}
            />
          )}

          {!detail.loading && !detail.data && <SupportDeskPlaceholder />}
        </div>
      </div>
    </div>
  );
}
