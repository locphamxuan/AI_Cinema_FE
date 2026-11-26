'use client';

import { useState } from 'react';
import { useResource } from '@/hooks/useResource';
import { adminService } from '@/services/adminService';
import { Panel, Empty, ErrorNote, Loading } from '@/components/data/ui';
import { MetaPager } from '@/components/data/MetaPager';

const PAGE_SIZE = 20;

/** Read-only member lookup for Staff. ID and email are intentionally hidden (sensitive data). */
export function StaffMembersLookup() {
  const [page, setPage] = useState(1);
  const list = useResource(`staff:members:${page}`, () => adminService.listAccounts({ role: 'MEMBER', page, limit: PAGE_SIZE }));
  const members = list.data?.data ?? null;
  const meta = list.data?.meta;

  return (
    <Panel
      title="Thành viên"
      description={`Danh sách Member${meta ? ` (${meta.totalItems})` : ''}. ID và email của Member được ẩn với Staff (dữ liệu nhạy cảm).`}
    >
      {list.error && <ErrorNote message={list.error} onRetry={list.reload} />}
      {list.loading && !members && <Loading label="Đang tải danh sách thành viên…" />}
      {members?.length === 0 && <Empty>Chưa có Member nào.</Empty>}
      {members && meta && members.length > 0 && (
        <>
          <ul className="divide-y divide-border text-xs">
            {members.map((member) => (
              <li key={member.id} className="px-6 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-medium text-foreground">{member.fullName}</span>
                  <p className="text-[11px] text-muted-foreground">
                    {member.isActive ? 'Đang hoạt động' : 'Đã khoá'}
                  </p>
                </div>
                <span className={member.isActive ? 'text-success' : 'text-destructive'}>
                  {member.isActive ? 'Hoạt động' : 'Khoá'}
                </span>
              </li>
            ))}
          </ul>
          <MetaPager meta={meta} onPage={setPage} />
        </>
      )}
    </Panel>
  );
}
