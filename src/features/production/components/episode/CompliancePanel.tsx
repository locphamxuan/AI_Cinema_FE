'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Panel, StatusPill } from '@/components/data/ui';
import { productionService } from '@/services/productionService';
import type { ComplianceInput, ReviewSheet } from '@/types/production';
import { useAction } from '@/hooks/useAction';
import { InForcePolicies } from '@/features/policies/InForcePolicies';
import { COMPLIANCE_CHECK, COMPLIANCE_RESULT } from '../../lib/labels';

type Verdict = { result: 'PASS' | 'FAIL' | null; failureReason: string };

/**
 * Step 11 (BR-42): the Reviewer checks the approved version against the policies in force, shown beside the form,
 * and confirms having compared them before recording the result.
 */
export function CompliancePanel({ sheet, canAct, onChanged }: { sheet: ReviewSheet; canAct: boolean; onChanged: () => Promise<void> }) {
  const savedCheck = (type: keyof typeof COMPLIANCE_CHECK) => sheet.complianceChecks.find((check) => check.checkType === type);
  const savedDecree = savedCheck('DECREE_142_NOTICE');
  const savedSafety = savedCheck('CONTENT_SAFETY');
  const savedRealPerson = savedCheck('REAL_PERSON_LIKENESS');
  const [decree, setDecree] = useState<Verdict>({ result: savedDecree?.result === 'PENDING' ? null : (savedDecree?.result ?? null), failureReason: savedDecree?.failureReason ?? '' });
  const [safety, setSafety] = useState<Verdict>({ result: savedSafety?.result === 'PENDING' ? null : (savedSafety?.result ?? null), failureReason: savedSafety?.failureReason ?? '' });
  const [realPerson, setRealPerson] = useState<boolean | null>(
    !sheet.aiDisclosure.noRealPersonLikeness ? null : savedRealPerson ? savedRealPerson.result === 'FAIL' : null,
  );
  const [realPersonNote, setRealPersonNote] = useState(savedRealPerson?.failureReason ?? '');
  const [compared, setCompared] = useState(false);
  const { busy, run } = useAction({ onStale: onChanged });

  const reasonOk = (v: Verdict) => v.result !== null && (v.result === 'PASS' || v.failureReason.trim().length >= 5);
  const filled = reasonOk(decree) && reasonOk(safety) && realPerson !== null && (realPerson === false || realPersonNote.trim().length >= 5);
  const valid = filled && compared;
  const fails = decree.result === 'FAIL' || safety.result === 'FAIL' || realPerson === true;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || realPerson === null) return;
    const item = (v: Verdict) => (v.result === 'PASS' ? { result: 'PASS' as const } : { result: 'FAIL' as const, failureReason: v.failureReason.trim() });
    const input: ComplianceInput = {
      decree142Notice: item(decree),
      contentSafety: item(safety),
      depictsRealPersonOrEvent: realPerson,
      ...(realPerson ? { realPersonNote: realPersonNote.trim() } : {}),
    };
    const done = await run(
      () => productionService.runCompliance(sheet.id, input),
      fails ? 'Không đạt - tập được trả về để Studio sửa' : 'Tập đạt kiểm tra tuân thủ',
    );
    if (done) await onChanged();
  };

  return (
    <Panel
      title="Kiểm tra pháp lý và an toàn nội dung"
      description="Rà soát nhãn AI, thông báo theo Nghị định 142, an toàn nội dung và nguy cơ gây nhầm lẫn với người hoặc sự kiện có thật. Nếu có mục không đạt, tập sẽ được gửi lại để Studio sửa."
    >
      {sheet.complianceChecks.length > 0 && (
        <ul className="space-y-1.5 text-xs mb-4">
          {sheet.complianceChecks.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-secondary-foreground">
                {COMPLIANCE_CHECK[c.checkType]}
                <span className="text-muted-foreground"> · theo {c.policy.name}</span>
              </span>
              <span className="flex items-center gap-2">
                {c.failureReason && <span className="text-rose-600">{c.failureReason}</span>}
                <StatusPill {...COMPLIANCE_RESULT[c.result]} />
              </span>
            </li>
          ))}
        </ul>
      )}
      {canAct && (
        <div className="grid gap-5 lg:grid-cols-2">
          <section aria-label="Chính sách cần đối chiếu" className="max-h-[32rem] overflow-y-auto rounded-lg bg-muted/40 p-4">
            <h3 className="mb-3 text-sm font-semibold">Chính sách cần đối chiếu</h3>
            <InForcePolicies />
          </section>
          <form onSubmit={submit} aria-label="Kết quả kiểm tra tuân thủ" className="space-y-3 text-xs">
            <VerdictRow label={COMPLIANCE_CHECK.DECREE_142_NOTICE} value={decree} onChange={setDecree} />
            <VerdictRow label={COMPLIANCE_CHECK.CONTENT_SAFETY} value={safety} onChange={setSafety} />
            <fieldset className="space-y-2">
              <legend className="font-medium text-secondary-foreground">Tập có mô tả người hoặc sự kiện có thật theo cách dễ gây hiểu nhầm không?</legend>
              <div className="flex gap-4">
                {([false, true] as const).map((value) => (
                  <label key={String(value)} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="real-person-or-event" checked={realPerson === value} onChange={() => setRealPerson(value)} />
                    {value ? 'Có' : 'Không'}
                  </label>
                ))}
              </div>
            </fieldset>
            {!sheet.aiDisclosure.noRealPersonLikeness && (
              <p className="text-amber-600">Studio chưa cam kết không dùng hình ảnh giống người thật. Mục này chưa thể đạt cho tới khi Studio bổ sung cam kết trong bản giao.</p>
            )}
            {realPerson === true && (
              <textarea
                rows={2}
                value={realPersonNote}
                onChange={(e) => setRealPersonNote(e.target.value)}
                maxLength={2000}
                placeholder="Mô tả chỗ vi phạm (tối thiểu 5 ký tự)…"
                aria-label="Ghi chú người/sự kiện thật"
                className={fieldTextareaClass}
              />
            )}
            <p className="text-muted-foreground">Hệ thống tự kiểm tra mục “Có nhãn AI” dựa trên nhãn đã gắn ở bước trước. Chọn kết quả cho từng mục; nếu không đạt, hãy ghi lý do.</p>
            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <input type="checkbox" checked={compared} onChange={(e) => setCompared(e.target.checked)} className="mt-0.5 size-4" />
              Tôi đã đối chiếu tập phim với các chính sách đang áp dụng
            </label>
            <Button type="submit" variant={fails ? 'danger' : 'success'} disabled={busy || !valid}>
              {!filled ? 'Hoàn tất các mục kiểm tra' : !compared ? 'Xác nhận đã đối chiếu chính sách' : fails ? 'Ghi nhận không đạt' : 'Xác nhận đã kiểm tra và đạt'}
            </Button>
          </form>
        </div>
      )}
    </Panel>
  );
}

function VerdictRow({ label, value, onChange }: { label: string; value: Verdict; onChange: (v: Verdict) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-secondary-foreground">{label}</span>
        <div className="flex gap-3">
          {(['PASS', 'FAIL'] as const).map((r) => (
            <label key={r} className="flex items-center gap-1 cursor-pointer">
              <input type="radio" name={label} checked={value.result === r} onChange={() => onChange({ ...value, result: r })} />
              {COMPLIANCE_RESULT[r].label}
            </label>
          ))}
        </div>
      </div>
      {value.result === 'FAIL' && (
        <input
          value={value.failureReason}
          onChange={(e) => onChange({ ...value, failureReason: e.target.value })}
          maxLength={2000}
          placeholder="Lý do không đạt (tối thiểu 5 ký tự)"
          aria-label={`Lý do không đạt: ${label}`}
          className={fieldInputClass}
        />
      )}
    </div>
  );
}
