'use client';

import { useState } from 'react';
import { Ban } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FormField, fieldTextareaClass } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import type { ProductionProject } from '@/types/workflow';

/**
 * The Reviewer stops a project for good: queued generations are cancelled and nothing more
 * can be planned or produced. A cancelled project shows why instead of the button.
 */
export function CancelProjectControl({ project }: { project: ProductionProject }) {
  const can = useCan();
  const cancelProject = useWorkflowStore((state) => state.cancelProject);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  if (project.overall_status === 'CANCELLED') {
    return (
      <div role="status" className="rounded-xl border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
        Dự án đã bị hủy — không thể lập kế hoạch hay sản xuất thêm.
      </div>
    );
  }
  if (project.overall_status === 'COMPLETED' || !can(PERMISSION.PROJECT_MANAGE)) return null;

  const confirm = async () => {
    setBusy(true);
    const ok = await cancelProject(project.id, reason.trim());
    setBusy(false);
    if (!ok) return;
    setOpen(false);
    toast.info('Đã hủy dự án', `${project.title} đã dừng; các yêu cầu AI đang chờ đã bị hủy.`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/30 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
      >
        <Ban className="w-3.5 h-3.5" aria-hidden="true" /> Hủy dự án
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Hủy dự án"
        subtitle="Không thể hoàn tác. Dự án không thể hủy khi AI đang tạo nội dung."
        maxWidth="max-w-md"
      >
        <FormField label="Lý do hủy">
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ví dụ: đổi kế hoạch phát hành, ngân sách không còn…"
            className={fieldTextareaClass}
          />
        </FormField>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Giữ dự án
          </Button>
          <Button variant="danger" onClick={confirm} disabled={!reason.trim() || busy}>
            {busy ? 'Đang hủy…' : 'Hủy dự án'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
