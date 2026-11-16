'use client';

import { useState } from 'react';
import { costRequestService } from '@/services/costRequestService';
import type { CostRequestStatus } from '@/types/cost';
import { useResource } from '@/hooks/useResource';
import { CostRequestCard } from '@/features/production/components/shared/CostRequestCard';
import { productionPaths } from '@/features/production/lib/routes';
import { Empty, ErrorNote, Loading, Panel } from '@/components/data/ui';
import { DataPagination } from '@/components/data/DataPagination';

const PAGE_SIZE = 20;

const FILTERS: { key: CostRequestStatus | 'ALL'; label: string }[] = [
  { key: 'OPEN', label: 'Chờ duyệt' },
  { key: 'APPROVED', label: 'Đã cấp' },
  { key: 'REJECTED', label: 'Đã từ chối' },
  { key: 'ALL', label: 'Tất cả' },
];

/** The Admin's inbox of "yêu cầu thêm chi phí sản xuất" sent by Reviewers, across every project. */
export function CostRequestInbox() {
  const [filter, setFilter] = useState<CostRequestStatus | 'ALL'>('OPEN');
  const [page, setPage] = useState(1);
  const requests = useResource(`cost-requests:${filter}:${page}`, () =>
    costRequestService.list(page, PAGE_SIZE, filter === 'ALL' ? undefined : filter),
  );
  const meta = requests.data?.meta;

  return (
    <Panel
      title="Yêu cầu thêm chi phí sản xuất"
      description="Reviewer gửi khi Studio đòi cao hơn ngân sách còn lại, kèm báo giá. Có thể cấp ít hơn số xin; số được cấp cộng vào ngân sách dự án."
    >
      <div role="tablist" aria-label="Lọc yêu cầu" className="flex flex-wrap gap-1 mb-4">
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
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              filter === key
                ? 'bg-[#121212] text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {requests.error && <ErrorNote message={requests.error} onRetry={requests.reload} />}
      {requests.loading && !requests.data && <Loading />}
      {requests.data?.data.length === 0 && <Empty>Không có yêu cầu nào.</Empty>}
      <ul className="space-y-3">
        {requests.data?.data.map((request) => (
          <CostRequestCard
            key={request.id}
            request={request}
            canDecide
            projectHref={productionPaths.project('/admin', request.projectId, 'fee')}
            onDecided={requests.reload}
          />
        ))}
      </ul>
      {meta && (
        <DataPagination page={meta.page} totalPages={meta.totalPages} totalItems={meta.total} pageSize={meta.limit} onChange={setPage} />
      )}
    </Panel>
  );
}
