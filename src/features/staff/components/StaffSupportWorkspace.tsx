'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RotateCw } from 'lucide-react';
import { StatCard } from '@/components/data/StatCard';
import { DataPagination } from '@/components/data/DataPagination';
import { Empty, ErrorNote, Loading, StatusPill } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { useResource } from '@/hooks/useResource';
import { formatDateTime } from '@/lib/format';
import { staffSupportService, type QueueFilters } from '@/services/staffSupportService';
import { useAppStore } from '@/store/useAppStore';
import type { SupportPriority, SupportStatus } from '@/types/support';
import { CASE_STATUS, ESCALATION, PRIORITY } from '../supportLabels';
import { StaffCaseChat } from './StaffCaseChat';

const SELECT = `${fieldInputClass} py-1.5 text-xs`;
const PAGE_SIZE = 20;

/** MF-5 support desk: the queue on the left (filtered and paged by the backend), the open case on the right. */
export function StaffSupportWorkspace({ isAdmin = false }: { isAdmin?: boolean }) {
  const me = useAppStore((s) => s.user);
  const [filters, setFilters] = useState<QueueFilters>({ status: 'WAITING_FOR_STAFF' });
  const [page, setPage] = useState(1);
  // A notification opens its case directly (?case=<id>).
  const [activeId, setActiveId] = useState<string | null>(useSearchParams().get('case'));

  const stats = useResource('staff:support:stats', staffSupportService.getStats);
  const queue = useResource(`staff:support:queue:${JSON.stringify(filters)}:${page}`, () => staffSupportService.listQueue(page, PAGE_SIZE, filters));

  const set = (patch: QueueFilters) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };
  const refresh = async () => {
    await Promise.all([queue.reload(), stats.reload()]);
  };

  const s = stats.data;
  const meta = queue.data?.meta;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Chờ nhân viên" value={s?.waiting ?? '—'} note={s?.oldestWaiting ? `Lâu nhất ${s.oldestWaiting.waitingMinutes} phút` : 'Không có case chờ'} noteTone={s?.oldestWaiting ? 'warn' : 'muted'} />
        <StatCard label="Đang xử lý" value={s?.byStatus.STAFF_HANDLING ?? '—'} />
        <StatCard label="Chuyển sang hôm nay" value={s?.escalatedToday ?? '—'} note={s ? `Đã giải quyết hôm nay: ${s.resolvedToday}` : undefined} />
        <StatCard label="AI tự giải quyết" value={s ? `${Math.round(s.aiResolvedRate * 100)}%` : '—'} note="Trên các case đã đóng gần đây" />
      </div>
      {stats.error && <ErrorNote message={stats.error} onRetry={stats.reload} />}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <section aria-label="Hàng chờ hỗ trợ" className="flex h-[720px] flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 lg:col-span-5">
          <header className="space-y-2.5 border-b border-border p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Hàng chờ {meta ? `(${meta.totalItems})` : ''}</h2>
              <Button size="sm" variant="ghost" onClick={() => void refresh()} disabled={queue.loading}>
                <RotateCw className={`size-3.5 ${queue.loading ? 'animate-spin' : ''}`} aria-hidden="true" /> Làm mới
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select aria-label="Lọc theo trạng thái" value={filters.status ?? ''} onChange={(e) => set({ status: (e.target.value || undefined) as SupportStatus | undefined })} className={SELECT}>
                <option value="">Mọi trạng thái</option>
                {(Object.keys(CASE_STATUS) as SupportStatus[]).map((k) => (
                  <option key={k} value={k}>
                    {CASE_STATUS[k].label}
                  </option>
                ))}
              </select>
              <select aria-label="Lọc theo ưu tiên" value={filters.priority ?? ''} onChange={(e) => set({ priority: (e.target.value || undefined) as SupportPriority | undefined })} className={SELECT}>
                <option value="">Mọi mức ưu tiên</option>
                {(Object.keys(PRIORITY) as SupportPriority[]).map((k) => (
                  <option key={k} value={k}>
                    {PRIORITY[k].label}
                  </option>
                ))}
              </select>
              <select aria-label="Lọc theo người nhận" value={filters.assignee ?? ''} onChange={(e) => set({ assignee: e.target.value || undefined })} className={SELECT}>
                <option value="">Mọi người nhận</option>
                {me?.id && <option value={me.id}>Case của tôi</option>}
                <option value="NONE">Chưa ai nhận</option>
              </select>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {queue.error && (
              <div className="p-4">
                <ErrorNote message={queue.error} onRetry={queue.reload} />
              </div>
            )}
            {queue.loading && !queue.data && <Loading />}
            {queue.data?.data.length === 0 && <Empty>Không có case nào theo bộ lọc này.</Empty>}
            <ul className="divide-y divide-border">
              {queue.data?.data.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    aria-current={activeId === c.id ? 'true' : undefined}
                    className={`w-full cursor-pointer space-y-1.5 border-l-4 px-4 py-3 text-left text-xs transition-colors ${
                      activeId === c.id ? 'border-l-primary bg-primary/5' : 'border-l-transparent hover:bg-muted/50'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{c.memberFullName}</span>
                      <StatusPill {...CASE_STATUS[c.status]} />
                    </span>
                    {c.escalationReason && <span className="block truncate text-muted-foreground">{ESCALATION[c.escalationReason]}</span>}
                    <span className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <span>
                        {c.priority !== 'NORMAL' && <span className="mr-1.5 font-medium text-warning">Ưu tiên {PRIORITY[c.priority].label.toLowerCase()}</span>}
                        {c.assignedAgentName ?? 'Chưa ai nhận'}
                      </span>
                      <span>{formatDateTime(c.lastMessageAt ?? c.createdAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {meta && (
            <div className="border-t border-border px-4 pb-3">
              <DataPagination page={meta.currentPage} totalPages={meta.totalPages} onChange={setPage} />
            </div>
          )}
        </section>

        <section aria-label="Chi tiết case" className="flex h-[720px] flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 lg:col-span-7">
          {activeId ? (
            <StaffCaseChat key={activeId} caseId={activeId} currentUserId={me?.id} isAdmin={isAdmin} onChanged={refresh} />
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
              Chọn một case ở hàng chờ để xem hội thoại, bối cảnh Member và trả lời.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
