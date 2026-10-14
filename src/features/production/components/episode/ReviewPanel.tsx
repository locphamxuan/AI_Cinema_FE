'use client';

import { useState } from 'react';
import { AlertTriangle, Check, ShieldCheck, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { productionService } from '@/services/productionService';
import type { ComplianceInput, ReviewSheet } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { REVIEWED_EPISODE, isIn } from '../../lib/capabilities';
import { AI_PARTS, COMPLIANCE_CHECK, COMPLIANCE_RESULT, LABEL_TYPE } from '../../lib/labels';
import { formatDateTime, formatDuration } from '../../lib/format';
import { Facts, Panel, StatusPill, TextPromptModal } from '../shared/ui';
import { LabelPanel } from './LabelPanel';

/**
 * Steps 8–11 on one delivered version: the review sheet, approve or send back to the studio (BR-16, BR-18),
 * the AI label (BR-40) and the compliance check (BR-42). `canAct` is the Reviewer in charge while the studio works.
 */
export function ReviewPanel({ sheet, canAct, onChanged }: { sheet: ReviewSheet; canAct: boolean; onChanged: () => Promise<void> }) {
  const [requesting, setRequesting] = useState(false);
  const { busy, run } = useAction();
  const status = sheet.episode.status;
  const underReview = status === 'IN_REVIEW' && sheet.ingestStatus === 'READY';
  const reviewed = isIn(status, REVIEWED_EPISODE) && sheet.isApprovedVersion;

  const approve = async () => {
    if (await run(() => productionService.review(sheet.id, 'APPROVED'), 'Đã duyệt bản này')) await onChanged();
  };
  const requestChanges = async (comments: string) => {
    if (await run(() => productionService.review(sheet.id, 'CHANGES_REQUESTED', comments), 'Đã gửi yêu cầu sửa cho Creator')) {
      setRequesting(false);
      await onChanged();
    }
  };

  const { durationCheck: d, aiDisclosure: ai } = sheet;

  return (
    <div className="space-y-5">
      <Panel
        title={`Phiếu duyệt — bản ${sheet.version}`}
        actions={
          canAct &&
          (underReview || reviewed) && (
            <>
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => setRequesting(true)}>
                <Undo2 className="w-3.5 h-3.5" aria-hidden="true" /> Yêu cầu sửa
              </Button>
              {underReview && (
                <Button size="sm" variant="success" disabled={busy} onClick={approve}>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" /> Duyệt
                </Button>
              )}
            </>
          )
        }
      >
        <Facts
          items={[
            [
              'Thời lượng',
              <span key="d" className={d.warning ? 'text-amber-600 font-semibold' : undefined}>
                {d.warning && <AlertTriangle className="inline w-3 h-3 mr-1" aria-hidden="true" />}
                {formatDuration(d.actualSeconds)} / mục tiêu {formatDuration(d.targetSeconds)}
                {d.deviationSeconds !== null && ` (${d.deviationSeconds > 0 ? '+' : ''}${formatDuration(d.deviationSeconds)})`}
              </span>,
            ],
            ['Công cụ AI', ai.aiTools.join(', ')],
            ['Phần do AI tạo', ai.aiGeneratedParts.map((p) => AI_PARTS.find((x) => x.value === p)?.label ?? p).join(', ')],
            ['Người chỉnh sửa', ai.humanEdited ? 'Có' : 'Không'],
            ['Cam kết BR-41', ai.noRealPersonLikeness && ai.noCopyrightedMaterial ? 'Đủ 2 cam kết' : 'Thiếu'],
            ['Nhãn đề xuất', LABEL_TYPE[sheet.proposedLabelType]],
          ]}
        />
        {sheet.contentReviews.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Lịch sử duyệt bản này</p>
            {sheet.contentReviews.map((r) => (
              <div key={r.id} className="rounded-lg bg-slate-50 dark:bg-white/5 p-2 text-xs">
                <p className={r.decision === 'APPROVED' ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                  {r.decision === 'APPROVED' ? 'Duyệt' : 'Yêu cầu sửa'} · {r.reviewer.fullName} · {formatDateTime(r.createdAt)}
                </p>
                {r.comments && <p className="text-slate-600 dark:text-slate-300 mt-0.5">{r.comments}</p>}
              </div>
            ))}
          </div>
        )}
      </Panel>

      {(sheet.aiContentLabel || (canAct && reviewed)) && <LabelPanel sheet={sheet} canAct={canAct && reviewed} onChanged={onChanged} />}
      {(sheet.complianceChecks.length > 0 || (canAct && sheet.isApprovedVersion && status === 'LABELED')) && (
        <CompliancePanel sheet={sheet} canAct={canAct && sheet.isApprovedVersion && status === 'LABELED'} onChanged={onChanged} />
      )}

      <TextPromptModal
        open={requesting}
        title="Yêu cầu studio sửa"
        subtitle="Creator sẽ chuyển nhận xét này cho studio và giao bản mới."
        label="Nhận xét (ví dụ: phút 03:10 nhân vật bị méo mặt…)"
        confirmLabel="Gửi yêu cầu sửa"
        danger
        busy={busy}
        onClose={() => setRequesting(false)}
        onConfirm={requestChanges}
      />
    </div>
  );
}

type Verdict = { result: 'PASS' | 'FAIL' | null; failureReason: string };

function CompliancePanel({ sheet, canAct, onChanged }: { sheet: ReviewSheet; canAct: boolean; onChanged: () => Promise<void> }) {
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
  const { busy, run } = useAction();

  const reasonOk = (v: Verdict) => v.result !== null && (v.result === 'PASS' || v.failureReason.trim().length >= 5);
  const valid = reasonOk(decree) && reasonOk(safety) && realPerson !== null && (realPerson === false || realPersonNote.trim().length >= 5);
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
      fails ? 'Không đạt — tập được trả về để studio sửa' : 'Tập đạt kiểm tra tuân thủ',
    );
    if (done) await onChanged();
  };

  return (
    <Panel
      title="Bước 11 — Kiểm tra pháp lý và an toàn nội dung"
      description="Rà soát nhãn AI, thông báo theo Nghị định 142, an toàn nội dung và nguy cơ gây nhầm lẫn với người hoặc sự kiện có thật. Nếu có mục không đạt, tập sẽ được gửi lại để studio sửa."
    >
      {sheet.complianceChecks.length > 0 && (
        <ul className="space-y-1.5 text-xs mb-4">
          {sheet.complianceChecks.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-700 dark:text-slate-200">{COMPLIANCE_CHECK[c.checkType]}</span>
              <span className="flex items-center gap-2">
                {c.failureReason && <span className="text-rose-600">{c.failureReason}</span>}
                <StatusPill {...COMPLIANCE_RESULT[c.result]} />
              </span>
            </li>
          ))}
        </ul>
      )}
      {canAct && (
        <form onSubmit={submit} className="space-y-3 text-xs">
          <VerdictRow label={COMPLIANCE_CHECK.DECREE_142_NOTICE} value={decree} onChange={setDecree} />
          <VerdictRow label={COMPLIANCE_CHECK.CONTENT_SAFETY} value={safety} onChange={setSafety} />
          <fieldset className="space-y-2">
            <legend className="font-medium text-slate-700 dark:text-slate-200">Tập có mô tả người hoặc sự kiện có thật theo cách dễ gây hiểu nhầm không?</legend>
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
            <p className="text-amber-600">Studio chưa cam kết không dùng hình ảnh giống người thật. Mục này chưa thể đạt cho tới khi studio bổ sung cam kết trong bản giao.</p>
          )}
          {realPerson === true && (
            <textarea
              rows={2}
              value={realPersonNote}
              onChange={(e) => setRealPersonNote(e.target.value)}
              placeholder="Mô tả chỗ vi phạm…"
              aria-label="Ghi chú người/sự kiện thật"
              className={fieldTextareaClass}
            />
          )}
          <p className="text-slate-500">Hệ thống tự kiểm tra mục “Có nhãn AI” dựa trên nhãn đã gắn ở bước trước. Chọn kết quả cho từng mục; nếu không đạt, hãy ghi lý do.</p>
          <Button type="submit" variant={fails ? 'danger' : 'success'} disabled={busy || !valid}>
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> {!valid ? 'Hoàn tất các mục kiểm tra' : fails ? 'Ghi nhận không đạt' : 'Xác nhận đã kiểm tra và đạt'}
          </Button>
        </form>
      )}
    </Panel>
  );
}

function VerdictRow({ label, value, onChange }: { label: string; value: Verdict; onChange: (v: Verdict) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
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
          placeholder="Lý do không đạt (tối thiểu 5 ký tự)"
          aria-label={`Lý do không đạt: ${label}`}
          className={fieldInputClass}
        />
      )}
    </div>
  );
}
