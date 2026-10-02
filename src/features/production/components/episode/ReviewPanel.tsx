'use client';

import { useState } from 'react';
import { AlertTriangle, Check, ShieldCheck, Tag, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { productionService } from '@/services/productionService';
import type { ComplianceInput, LabelLocation, LabelType, ReviewSheet } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { REVIEWED_EPISODE, isIn } from '../../lib/capabilities';
import { AI_PARTS, COMPLIANCE_CHECK, COMPLIANCE_RESULT, LABEL_DEFAULT_TEXT, LABEL_LOCATION, LABEL_TYPE } from '../../lib/labels';
import { formatDateTime, formatDuration } from '../../lib/format';
import { Facts, Panel, StatusPill, TextPromptModal } from '../shared/ui';

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

      {(sheet.aiContentLabel || (canAct && sheet.isApprovedVersion && status === 'APPROVED')) && (
        <LabelPanel sheet={sheet} canAct={canAct && sheet.isApprovedVersion && status === 'APPROVED'} onChanged={onChanged} />
      )}
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

function LabelPanel({ sheet, canAct, onChanged }: { sheet: ReviewSheet; canAct: boolean; onChanged: () => Promise<void> }) {
  const [labelType, setLabelType] = useState<LabelType>(sheet.proposedLabelType);
  const [text, setText] = useState(LABEL_DEFAULT_TEXT[sheet.proposedLabelType]);
  const [location, setLocation] = useState<LabelLocation>('TOP_RIGHT');
  const { busy, run } = useAction();
  const label = sheet.aiContentLabel;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () => productionService.applyLabel(sheet.id, { labelType, labelText: text.trim(), displayLocation: location }),
      'Đã gắn nhãn AI',
    );
    if (done) await onChanged();
  };

  return (
    <Panel title="Nhãn nội dung AI (BR-40)" description={label ? `Theo chính sách: ${label.policy.name}` : 'Bước 10 — người xem thấy nhãn này khi phát.'}>
      {label ? (
        <Facts
          items={[
            ['Loại nhãn', LABEL_TYPE[label.labelType]],
            ['Nội dung', label.labelText],
            ['Vị trí', label.displayLocation ? LABEL_LOCATION[label.displayLocation] : '—'],
            ['Gắn lúc', formatDateTime(label.appliedAt)],
          ]}
        />
      ) : (
        canAct && (
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Loại nhãn">
                <select
                  value={labelType}
                  onChange={(e) => {
                    const t = e.target.value as LabelType;
                    setLabelType(t);
                    setText(LABEL_DEFAULT_TEXT[t]);
                  }}
                  className={fieldInputClass}
                >
                  {(Object.keys(LABEL_TYPE) as LabelType[]).map((t) => (
                    <option key={t} value={t}>
                      {LABEL_TYPE[t]}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Vị trí hiển thị">
                <select value={location} onChange={(e) => setLocation(e.target.value as LabelLocation)} className={fieldInputClass}>
                  {(Object.keys(LABEL_LOCATION) as LabelLocation[]).map((l) => (
                    <option key={l} value={l}>
                      {LABEL_LOCATION[l]}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <FormField label="Nội dung nhãn">
              <input value={text} onChange={(e) => setText(e.target.value)} minLength={5} maxLength={500} className={fieldInputClass} />
            </FormField>
            <Button type="submit" disabled={busy || text.trim().length < 5}>
              <Tag className="w-3.5 h-3.5" aria-hidden="true" /> Gắn nhãn
            </Button>
          </form>
        )
      )}
    </Panel>
  );
}

type Verdict = { result: 'PASS' | 'FAIL'; failureReason: string };

function CompliancePanel({ sheet, canAct, onChanged }: { sheet: ReviewSheet; canAct: boolean; onChanged: () => Promise<void> }) {
  const [decree, setDecree] = useState<Verdict>({ result: 'PASS', failureReason: '' });
  const [safety, setSafety] = useState<Verdict>({ result: 'PASS', failureReason: '' });
  const [realPerson, setRealPerson] = useState(false);
  const [realPersonNote, setRealPersonNote] = useState('');
  const { busy, run } = useAction();

  const reasonOk = (v: Verdict) => v.result === 'PASS' || v.failureReason.trim().length >= 5;
  const valid = reasonOk(decree) && reasonOk(safety) && (!realPerson || realPersonNote.trim().length >= 5);
  const fails = decree.result === 'FAIL' || safety.result === 'FAIL' || realPerson;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <Panel title="Kiểm tra tuân thủ (BR-42)" description="Bước 11 — một mục không đạt sẽ trả tập về để studio sửa.">
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
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={realPerson} onChange={(e) => setRealPerson(e.target.checked)} />
            Tập có mô tả người hoặc sự kiện có thật gây hiểu nhầm
          </label>
          {realPerson && (
            <textarea
              rows={2}
              value={realPersonNote}
              onChange={(e) => setRealPersonNote(e.target.value)}
              placeholder="Mô tả chỗ vi phạm…"
              aria-label="Ghi chú người/sự kiện thật"
              className={fieldTextareaClass}
            />
          )}
          <p className="text-slate-500">Mục “Có nhãn AI” được hệ thống tự đánh giá từ nhãn đã gắn.</p>
          <Button type="submit" variant={fails ? 'danger' : 'success'} disabled={busy || !valid}>
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> {fails ? 'Ghi nhận không đạt' : 'Xác nhận đạt'}
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
