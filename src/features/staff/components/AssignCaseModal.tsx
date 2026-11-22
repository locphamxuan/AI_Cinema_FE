'use client';

import { useState } from 'react';
import { ErrorNote, Loading } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { adminService } from '@/services/adminService';
import { staffSupportService } from '@/services/staffSupportService';

/** Admin (`support:case.assign`): hand an open case to one active Staff member. */
export function AssignCaseModal({
  caseId,
  currentAgentId,
  onClose,
  onAssigned,
}: {
  caseId: string;
  currentAgentId: string | null;
  onClose: () => void;
  onAssigned: () => Promise<void>;
}) {
  const staff = useResource('admin:accounts:staff', () => adminService.listAccounts({ role: 'STAFF', limit: 100 }));
  const [staffId, setStaffId] = useState(currentAgentId ?? '');
  const { busy, run } = useAction();
  const active = staff.data?.data.filter((a) => a.isActive) ?? [];

  const assign = async () => {
    if (staffId && (await run(() => staffSupportService.assign(caseId, staffId), 'Đã giao yêu cầu'))) await onAssigned();
  };

  return (
    <Modal open onClose={onClose} title="Giao yêu cầu cho nhân viên" subtitle="Nhân viên được giao nhận thông báo và xử lý yêu cầu này." maxWidth="max-w-md">
      {staff.error && <ErrorNote message={staff.error} onRetry={staff.reload} />}
      {staff.loading && !staff.data && <Loading />}
      {staff.data && (
        <div className="space-y-4">
          <FormField label="Nhân viên">
            <select value={staffId} onChange={(e) => setStaffId(e.target.value)} className={fieldInputClass}>
              <option value="">Chọn nhân viên</option>
              {active.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName} ({a.email})
                </option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
              Huỷ
            </Button>
            <Button type="button" onClick={() => void assign()} disabled={busy || !staffId || staffId === currentAgentId}>
              Giao yêu cầu
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
