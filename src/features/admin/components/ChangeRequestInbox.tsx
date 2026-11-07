'use client';

import { useState } from 'react';
import { changeRequestService } from '@/services/teamService';
import type { ChangeRequestStatus } from '@/types/production';
import { useResource } from '@/hooks/useResource';
import { ChangeRequestCard } from '@/features/production/components/shared/ChangeRequestCard';
import { productionPaths } from '@/features/production/lib/routes';
import { Empty, ErrorNote, Loading, Panel } from '@/components/data/ui';
import { Pager, pageOf } from '@/components/data/Pager';

const FILTERS: { key: ChangeRequestStatus | 'ALL'; label: string }[] = [
  { key: 'OPEN', label: 'Chờ duyệt' },
  { key: 'APPROVED', label: 'Đã duyệt' },
  { key: 'REJECTED', label: 'Đã từ chối' },
  { key: 'ALL', label: 'Tất cả' },
];

/** The Admin's inbox of change requests from Reviewers and Creators, across every project (BR-55). */
export function ChangeRequestInbox() {
  const [filter, setFilter] = useState<ChangeRequestStatus | 'ALL'>('OPEN');
  const requests = useResource(`change-requests:${filter}`, () => changeRequestService.inbox(filter === 'ALL' ? undefined : filter));
  const [page, setPage] = useState(1);
  const paged = pageOf(requests.data ?? [], page, 10);

  return (
    <Panel
      title="Đề xuất từ Reviewer và Creator"
      description="Đề xuất chỉnh sửa dự án, xin thêm kinh phí hoặc gia hạn, kèm lý do và giấy tờ. Duyệt đề xuất xin kinh phí sẽ tự cấp Token cho Reviewer của dự án."
    >
      <div role="tablist" aria-label="Lọc đề xuất" className="flex flex-wrap gap-1 mb-4">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            onClick={() => {
              setFilter(key);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              filter === key
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {requests.error && <ErrorNote message={requests.error} onRetry={requests.reload} />}
      {requests.loading && !requests.data && <Loading />}
      {requests.data?.length === 0 && <Empty>Không có đề xuất nào.</Empty>}
      <ul className="space-y-3">
        {paged.rows?.map((request) => (
          <ChangeRequestCard
            key={request.id}
            request={request}
            canDecide
            projectHref={productionPaths.project('/admin', request.projectId, 'changes')}
            onDecided={requests.reload}
          />
        ))}
      </ul>
      <Pager page={page} totalPages={paged.totalPages} onChange={setPage} />
    </Panel>
  );
}
