import type { EpisodePackage } from '@/types/workflow';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export interface SubmitEpisodeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPackage: EpisodePackage;
  jobsCount: number;
}

export function SubmitEpisodeModal({ open, onClose, onConfirm, currentPackage, jobsCount }: SubmitEpisodeModalProps) {
  const rows: Array<[string, string]> = [
    ['Tập phim', currentPackage.title],
    ['Số phân cảnh', `${jobsCount}`],
    ['Thời lượng', currentPackage.total_duration || 'Chưa có'],
    ['Token được cấp', `${currentPackage.quota_allocated}`],
    ['Token đã dùng', `${currentPackage.actual_tokens_used}`],
  ];

  return (
    <Modal open={open} onClose={onClose} title="Nộp bản dựng">
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        Cả {jobsCount} phân cảnh đã tạo xong. Sau khi nộp, người kiểm duyệt sẽ xem nội dung và kiểm định pháp lý cho tập này.
      </p>

      <dl className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
        {rows.map(([term, detail]) => (
          <div key={term} className="flex items-center justify-between gap-4 py-2">
            <dt className="text-slate-500 dark:text-slate-400">{term}</dt>
            <dd className="font-medium text-slate-900 dark:text-white text-right tabular-nums">{detail}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="success" onClick={onConfirm}>
          Nộp bản dựng
        </Button>
      </div>
    </Modal>
  );
}
