import { Minus, Plus } from 'lucide-react';
import type { EpisodePackage } from '@/types/workflow';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { clamp } from '@/features/workflow/lib/limits';

export interface AllocateQuotaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPackage?: EpisodePackage;
  quota: number;
  onQuotaChange: (value: number) => void;
  /** Project budget not yet granted to any episode — the hard ceiling for this grant. */
  availableBudget: number;
}

const MIN_QUOTA = 50;
const STEP = 50;
const STEPPER_CLASS =
  'w-9 h-9 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 disabled:opacity-40 disabled:cursor-not-allowed';

export function AllocateQuotaModal({ open, onClose, onConfirm, currentPackage, quota, onQuotaChange, availableBudget }: AllocateQuotaModalProps) {
  const ceiling = Math.max(MIN_QUOTA, availableBudget + (currentPackage?.quota_allocated || 0));
  const estimate = currentPackage?.brief.estimated_tokens ?? 0;
  const isOverBudget = ceiling < MIN_QUOTA;
  const setQuota = (value: number) => onQuotaChange(clamp(value, MIN_QUOTA, ceiling));

  return (
    <Modal open={open} onClose={onClose} title="Cấp token cho tập" subtitle={currentPackage?.title} maxWidth="max-w-md">
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-slate-500 dark:text-slate-400">Creator dự toán</dt>
          <dd className="font-medium text-slate-900 dark:text-white tabular-nums">{estimate} token</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500 dark:text-slate-400">Ngân sách còn lại của dự án</dt>
          <dd className="font-medium text-slate-900 dark:text-white tabular-nums">{availableBudget.toLocaleString()} token</dd>
        </div>
      </dl>

      <div className="space-y-2">
        <label htmlFor="quota-input" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          Số token cấp
        </label>
        <div className="flex items-center gap-2">
          <button type="button" aria-label={`Giảm ${STEP} token`} onClick={() => setQuota(quota - STEP)} disabled={quota <= MIN_QUOTA} className={STEPPER_CLASS}>
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>
          <input
            id="quota-input"
            type="number"
            min={MIN_QUOTA}
            max={ceiling}
            step={STEP}
            value={quota}
            onChange={(e) => setQuota(Number(e.target.value))}
            className={`${fieldInputClass} text-center font-mono tabular-nums`}
          />
          <button type="button" aria-label={`Tăng ${STEP} token`} onClick={() => setQuota(quota + STEP)} disabled={quota >= ceiling} className={STEPPER_CLASS}>
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        {estimate > 0 && (
          <button
            type="button"
            onClick={() => setQuota(estimate)}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
          >
            Dùng đúng mức dự toán ({estimate} token)
          </button>
        )}
        {isOverBudget && <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">Ngân sách dự án không còn đủ để cấp thêm token.</p>}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="success" onClick={onConfirm} disabled={isOverBudget}>
          Cấp token
        </Button>
      </div>
    </Modal>
  );
}
