'use client';

import { useEffect, useState } from 'react';
import { workflowService } from '@/services/workflowService';
import type { ApiProductionEvent } from '@/types/workflow-api';

/** Plain-Vietnamese name of each production event (PROJECT_OVERVIEW.md §4.1.4). */
const EVENT_LABEL: Record<string, string> = {
  PROJECT_CREATED: 'Tạo dự án',
  PROJECT_CANCELLED: 'Hủy dự án',
  PRODUCTION_PLAN_SUBMITTED: 'Nộp kế hoạch',
  PRODUCTION_PLAN_APPROVED: 'Duyệt kế hoạch',
  PRODUCTION_PLAN_CHANGES_REQUESTED: 'Yêu cầu sửa kế hoạch',
  EPISODE_QUOTA_ALLOCATED: 'Cấp token',
  QUOTA_TOPUP_REQUESTED: 'Xin thêm token',
  QUOTA_TOPUP_APPROVED: 'Duyệt cấp thêm token',
  QUOTA_TOPUP_REJECTED: 'Từ chối cấp thêm token',
  GENERATION_COMPLETED: 'AI tạo xong nội dung',
  GENERATION_FAILED: 'AI tạo nội dung thất bại',
  EPISODE_ASSEMBLED: 'Dựng bản cắt',
  EPISODE_SUBMITTED: 'Nộp tập',
  EPISODE_APPROVED: 'Duyệt bản cắt',
  CONTENT_CHANGES_REQUESTED: 'Yêu cầu sửa bản cắt',
  EPISODE_REJECTED: 'Từ chối bản cắt',
  COMPLIANCE_PASSED: 'Đạt kiểm định pháp lý',
  COMPLIANCE_CHANGES_REQUESTED: 'Không đạt kiểm định pháp lý',
  EPISODE_SCHEDULED: 'Lên lịch phát hành',
  EPISODE_PUBLISHED: 'Phát hành',
  EPISODE_UNPUBLISHED: 'Gỡ phát hành',
};

const FAILED = new Set(['GENERATION_FAILED', 'PROJECT_CANCELLED', 'EPISODE_REJECTED', 'COMPLIANCE_CHANGES_REQUESTED']);
const SHOWN = 12;

/** The short detail worth showing next to an event, if its payload has one. */
function detailOf(event: ApiProductionEvent): string | null {
  const p = event.payload ?? {};
  const text = p.reason ?? p.note ?? p.comments ?? p.errorMessage;
  if (typeof text === 'string' && text.trim()) return text;
  const tokens = p.allocatedAmount ?? p.requestedAmount ?? p.approvedAmount ?? p.tokenCost;
  if (typeof tokens === 'number') return `${tokens.toLocaleString('vi-VN')} token`;
  if (typeof p.scheduledAt === 'string') return new Date(p.scheduledAt).toLocaleString('vi-VN');
  return null;
}

/** Who did what and when on the project, newest first. */
export function ProjectActivityLog({ projectId }: { projectId: string }) {
  const [events, setEvents] = useState<ApiProductionEvent[] | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let alive = true;
    void workflowService.getProjectEvents(projectId).then((res) => {
      if (alive) setEvents(res.success ? res.data : []);
    });
    return () => {
      alive = false;
    };
  }, [projectId]);

  const visible = showAll ? events : events?.slice(0, SHOWN);

  return (
    <section aria-label="Nhật ký hoạt động" className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs p-5 space-y-3">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Nhật ký hoạt động</h3>
      {events === null ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">Đang tải…</p>
      ) : events.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">Chưa có hoạt động nào được ghi lại.</p>
      ) : (
        <ol className="space-y-2.5">
          {visible!.map((event) => {
            const detail = detailOf(event);
            return (
              <li key={event.id} className="flex gap-3 text-xs">
                <span
                  className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${FAILED.has(event.action) ? 'bg-rose-500' : 'bg-purple-500'}`}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-slate-800 dark:text-slate-200">
                    <span className="font-medium">{EVENT_LABEL[event.action] ?? event.action}</span>
                    <span className="text-slate-500 dark:text-slate-400"> · {event.actor?.fullName ?? 'Hệ thống'}</span>
                  </p>
                  {detail && <p className="text-slate-500 dark:text-slate-400 truncate">{detail}</p>}
                  <p className="text-slate-400 dark:text-slate-500">{new Date(event.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {events && events.length > SHOWN && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
        >
          {showAll ? 'Thu gọn' : `Xem tất cả ${events.length} hoạt động`}
        </button>
      )}
    </section>
  );
}
