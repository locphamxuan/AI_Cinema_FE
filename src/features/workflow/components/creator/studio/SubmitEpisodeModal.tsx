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
  return (
    <Modal open={open} onClose={onClose} title="Nộp Bản Dựng Tập Phim Cho Reviewer">
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        Tất cả {jobsCount} phân cảnh đã được render hoàn chỉnh. Xác nhận nộp gói tập phim (<code>episode_package</code>) sang Reviewer để
        thực hiện thẩm định nội dung & kiểm định pháp lý AI.
      </p>

      <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Tên tập phim:</span>
          <span className="font-bold text-slate-900 dark:text-white">{currentPackage.title}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Số lượng phân cảnh:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">{jobsCount} Cảnh</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Thời lượng ước tính:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">{currentPackage.total_duration}</span>
        </div>
        <div className="h-px bg-slate-200 dark:bg-white/10 my-1" />
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Token Quota được cấp:</span>
          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{currentPackage.quota_allocated} Tokens</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Token thực tế tiêu thụ:</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{currentPackage.actual_tokens_used} Tokens</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>
          Hủy bỏ
        </Button>
        <Button variant="success" onClick={onConfirm}>
          Xác Nhận Nộp Cho Checker
        </Button>
      </div>
    </Modal>
  );
}
