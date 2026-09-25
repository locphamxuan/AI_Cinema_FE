import { Check } from 'lucide-react';
import type { DisplayLocation } from '@/types/workflow';
import type { ComplianceCheckType } from '@/types/workflow-api';

/** Checks the Reviewer answers by hand; AI_LABEL_PRESENCE is evaluated by the backend from the package's labels. */
export type ManualComplianceCheck = Exclude<ComplianceCheckType, 'AI_LABEL_PRESENCE'>;

export const MANUAL_COMPLIANCE_CHECKS: { type: ManualComplianceCheck; title: string; description: string }[] = [
  { type: 'CONTENT_POLICY', title: 'Chính sách nội dung (Điều 44)', description: 'Nội dung phù hợp chính sách nền tảng, không có nội dung nhạy cảm.' },
  { type: 'LEGAL', title: 'Pháp lý (Nghị định 142)', description: 'Đáp ứng quy định pháp luật về nội dung do AI tạo.' },
  { type: 'COPYRIGHT', title: 'Bản quyền', description: 'Không sử dụng tài sản vi phạm bản quyền.' },
  { type: 'WATERMARK', title: 'Dấu mờ xác thực', description: 'Đã nhúng mã xác thực trong luồng video.' },
  { type: 'REAL_PERSON_LIKENESS', title: 'Không mô phỏng người thật', description: 'Không tái hiện người hay sự kiện có thật (BR-43).' },
];

export interface ComplianceStationProps {
  isCompliancePassed: boolean;
  isPassingCompliance: boolean;
  /** The cut waits for the Reviewer's decision; otherwise nothing can be confirmed. */
  canConfirm: boolean;
  checks: Record<ManualComplianceCheck, boolean>;
  onCheckChange: (type: ManualComplianceCheck, value: boolean) => void;
  displayLocation: DisplayLocation;
  onConfirm: () => void;
}

interface CheckRowProps {
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}

function CheckRow({ title, description, checked, disabled, onChange }: CheckRowProps) {
  return (
    <li>
      <label className="flex items-start gap-3 py-3 cursor-pointer has-[:disabled]:cursor-default">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-purple-600 shrink-0"
        />
        <span className="min-w-0">
          <span className="block text-sm font-medium text-slate-900 dark:text-white">{title}</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</span>
        </span>
      </label>
    </li>
  );
}

/** Step 1 of the video audit: the legal checklist the Reviewer signs off before publishing. */
export function ComplianceStation({
  isCompliancePassed,
  isPassingCompliance,
  canConfirm,
  checks,
  onCheckChange,
  displayLocation,
  onConfirm,
}: ComplianceStationProps) {
  const allChecked = MANUAL_COMPLIANCE_CHECKS.every((c) => checks[c.type]);
  const labelPlacement = displayLocation === 'INTRO_OUTRO' ? 'ở đầu và cuối phim (5 giây)' : 'trong suốt thời lượng phim';

  return (
    <section aria-labelledby="compliance-title" className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151822] p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="compliance-title" className="text-sm font-semibold text-slate-900 dark:text-white">
          <span className="text-slate-400 font-normal mr-1.5">1.</span>Kiểm định pháp lý
        </h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className={`w-1.5 h-1.5 rounded-full ${isCompliancePassed ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-hidden="true" />
          {isCompliancePassed ? 'Đã đạt' : 'Chưa xác nhận'}
        </span>
      </div>

      <ul className="mt-2 divide-y divide-slate-100 dark:divide-white/5">
        {MANUAL_COMPLIANCE_CHECKS.map((c) => (
          <CheckRow
            key={c.type}
            title={c.title}
            description={c.description}
            checked={checks[c.type]}
            disabled={isCompliancePassed}
            onChange={(value) => onCheckChange(c.type, value)}
          />
        ))}
      </ul>

      <p className="text-xs text-slate-500 dark:text-slate-400 py-3 border-t border-slate-100 dark:border-white/5">
        Nhãn AI (Điều 44) được gắn khi xác nhận và hiển thị {labelPlacement}; hệ thống tự kiểm tra sự có mặt của nhãn.
      </p>

      {!allChecked && !isCompliancePassed && (
        <p role="status" className="mb-3 text-xs text-amber-700 dark:text-amber-400">
          Cần đạt tất cả các mục mới xác nhận được. Nếu có mục chưa đạt, dùng &quot;Yêu cầu sửa&quot; để trả về cho người sản xuất.
        </p>
      )}

      <button
        type="button"
        onClick={onConfirm}
        disabled={isPassingCompliance || isCompliancePassed || !allChecked || !canConfirm}
        className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition bg-purple-600 hover:bg-purple-700 text-white disabled:bg-slate-100 dark:disabled:bg-white/5 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#151822]"
      >
        {isCompliancePassed && <Check className="w-4 h-4" aria-hidden="true" />}
        {isPassingCompliance ? 'Đang lưu…' : isCompliancePassed ? 'Đã xác nhận đạt chuẩn' : 'Xác nhận đạt chuẩn'}
      </button>
    </section>
  );
}
