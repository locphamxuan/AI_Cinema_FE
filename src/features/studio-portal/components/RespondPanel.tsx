'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldTextareaClass } from '@/components/ui/FormField';
import { useAction } from '@/features/production/hooks/useAction';
import { formatDateTime } from '@/features/production/lib/format';
import { Panel } from '@/features/production/components/shared/ui';
import { studioPortalService } from '@/services/studioPortalService';
import type { StudioPortalOverview } from '@/types/studio-portal';

/** What the studio agrees to by taking the project. */
export const STUDIO_TERMS = [
  'Thực hiện theo brief, đúng thời lượng và hạn giao từng tập.',
  'Mỗi bản giao kèm khai báo trung thực về công cụ AI và phần do AI tạo.',
  'Không dùng hình ảnh, giọng nói người thật hay tài liệu có bản quyền của bên thứ ba khi chưa được phép.',
  'AI Cinema được kiểm duyệt, yêu cầu sửa, gắn nhãn nội dung AI và phát hành bản đã duyệt.',
];

/** The studio takes or declines the project, once; afterwards the panel only says what it answered. */
export function RespondPanel({
  token,
  overview,
  onAnswered,
}: {
  token: string;
  overview: StudioPortalOverview;
  onAnswered: () => Promise<void>;
}) {
  const [agreed, setAgreed] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  const { busy, run } = useAction();
  const { studio } = overview;

  if (studio.response === 'ACCEPTED') {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
        Studio đã nhận dự án lúc {formatDateTime(studio.respondedAt)}. Giao từng tập ở danh sách bên dưới.
      </p>
    );
  }
  if (studio.response === 'DECLINED') {
    return (
      <p className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-3 text-xs text-rose-800 dark:text-rose-300">
        <XCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
        <span>
          Studio đã từ chối dự án lúc {formatDateTime(studio.respondedAt)}: {studio.declineReason}
        </span>
      </p>
    );
  }

  const answer = async (decision: 'ACCEPT' | 'DECLINE') => {
    const input = decision === 'ACCEPT' ? ({ decision, acceptTerms: true } as const) : ({ decision, reason: reason.trim() } as const);
    const done = await run(
      () => studioPortalService.respond(token, input),
      decision === 'ACCEPT' ? 'Đã nhận dự án' : 'Đã gửi lời từ chối',
    );
    if (done) await onAnswered();
  };

  return (
    <Panel title="Xác nhận nhận dự án" description="Đọc brief và hạn giao bên dưới trước khi trả lời. Chỉ trả lời được một lần.">
      {declining ? (
        <div className="space-y-3">
          <FormField label="Lý do từ chối (người phụ trách sẽ chọn studio khác)">
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} minLength={5} maxLength={2000} className={fieldTextareaClass} />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setDeclining(false)}>
              Quay lại
            </Button>
            <Button type="button" variant="danger" disabled={busy || reason.trim().length < 5} onClick={() => answer('DECLINE')}>
              Từ chối dự án
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-xs">
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
            {STUDIO_TERMS.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
          <label className="flex items-start gap-2 cursor-pointer font-medium text-slate-800 dark:text-slate-200">
            <input type="checkbox" className="mt-0.5" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            Studio đã đọc brief và đồng ý các điều khoản trên.
          </label>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setDeclining(true)}>
              Từ chối
            </Button>
            <Button type="button" disabled={!agreed || busy} onClick={() => answer('ACCEPT')}>
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Nhận dự án
            </Button>
          </div>
        </div>
      )}
    </Panel>
  );
}
