'use client';

import { useEffect, useState } from 'react';
import { adminService, type AccountRow } from '@/services/adminService';
import { Panel, Empty, Loading } from '@/components/data/ui';

/** Read-only member lookup for Staff. ID and email are intentionally hidden (sensitive data). */
export function StaffMembersLookup() {
  const [members, setMembers] = useState<AccountRow[] | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    void adminService.listAccounts({ role: 'MEMBER', limit: 50 }).then((res) => {
      setMembers(res.success ? res.data.data : []);
      setTotal(res.success ? res.data.meta.totalItems : 0);
    });
  }, []);

  return (
    <Panel
      title="Thành viên"
      description={`Danh sách Member (${total}). ID và email của Member được ẩn với Staff (dữ liệu nhạy cảm).`}
    >
      {members === null && <Loading label="Đang tải danh sách thành viên…" />}
      {members?.length === 0 && <Empty>Chưa có Member nào.</Empty>}
      {members && members.length > 0 && (
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
      )}
    </Panel>
  );
}
