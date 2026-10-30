'use client';

import { useState } from 'react';
import { Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { productionService } from '@/services/productionService';
import type { LabelLocation, LabelType, ReviewSheet } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { LABEL_DEFAULT_TEXT, LABEL_LOCATION, LABEL_TYPE } from '../../lib/labels';
import { formatDateTime } from '../../lib/format';
import { Facts, Panel } from '../shared/ui';

const POSITION: Record<LabelLocation, string> = {
  TOP_RIGHT: 'top-2 right-2',
  TOP_LEFT: 'top-2 left-2',
  BOTTOM_RIGHT: 'bottom-2 right-2',
  BOTTOM_LEFT: 'bottom-2 left-2',
  INTRO_NOTICE: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

/** What the viewer sees over the video: the AI label at the chosen place (BR-40, Điều 44 Luật AI, Điều 18 NĐ 142). */
function LabelPreview({ text, location }: { text: string; location: LabelLocation }) {
  return (
    <div
      role="img"
      aria-label={`Xem trước nhãn AI: ${text}`}
      className="relative aspect-video w-full max-w-xs rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 overflow-hidden"
    >
      <span className={`absolute ${POSITION[location]} max-w-[80%] rounded bg-black/70 px-2 py-1 text-xs font-semibold text-white`}>{text}</span>
    </div>
  );
}

/**
 * Step 10: the Reviewer confirms the label the Creator proposed or changes it, and sees how it will show over the
 * video. Changing a label after the legal check sends the episode back to be checked again.
 */
export function LabelPanel({ sheet, canAct, onChanged }: { sheet: ReviewSheet; canAct: boolean; onChanged: () => Promise<void> }) {
  const label = sheet.aiContentLabel;
  const [editing, setEditing] = useState(false);
  const [labelType, setLabelType] = useState<LabelType>(label?.labelType ?? sheet.proposedLabelType);
  const [text, setText] = useState(label?.labelText ?? LABEL_DEFAULT_TEXT[sheet.proposedLabelType]);
  const [location, setLocation] = useState<LabelLocation>(label?.displayLocation ?? 'TOP_RIGHT');
  const { busy, run } = useAction();
  const form = canAct && (!label || editing);
  const recheck = !!label && sheet.episode.status !== 'APPROVED';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = await run(
      () => productionService.applyLabel(sheet.id, { labelType, labelText: text.trim(), displayLocation: location }),
      label ? 'Đã đổi nhãn AI' : 'Đã gắn nhãn AI',
    );
    if (done) {
      setEditing(false);
      await onChanged();
    }
  };

  return (
    <Panel
      title="Nhãn nội dung AI"
      description={label ? `Theo chính sách: ${label.policy.name}` : 'Bước 10 - người xem thấy nhãn này trên mọi màn hình phát video.'}
      actions={
        canAct &&
        label &&
        !editing && (
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            <Tag className="w-3.5 h-3.5" aria-hidden="true" /> Đổi nhãn
          </Button>
        )
      }
    >
      {label && !form && (
        <div className="space-y-3">
          <Facts
            items={[
              ['Creator đề xuất', LABEL_TYPE[sheet.proposedLabelType]],
              ['Loại nhãn đã gắn', LABEL_TYPE[label.labelType]],
              ['Nội dung', label.labelText],
              ['Vị trí', label.displayLocation ? LABEL_LOCATION[label.displayLocation] : '-'],
              ['Gắn lúc', formatDateTime(label.appliedAt)],
            ]}
          />
          <LabelPreview text={label.labelText} location={label.displayLocation ?? 'TOP_RIGHT'} />
        </div>
      )}
      {form && (
        <form onSubmit={submit} className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Creator đề xuất “{LABEL_TYPE[sheet.proposedLabelType]}”. Xác nhận hoặc chọn loại nhãn khác theo nội dung thực tế của bản dựng.
          </p>
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
          <LabelPreview text={text.trim() || '…'} location={location} />
          {recheck && <p className="text-[11px] text-amber-600 dark:text-amber-400">Đổi nhãn sẽ đưa tập về “Đã gắn nhãn AI” và phải kiểm tra pháp lý lại.</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={busy || text.trim().length < 5}>
              <Tag className="w-3.5 h-3.5" aria-hidden="true" /> {label ? 'Lưu nhãn' : 'Gắn nhãn'}
            </Button>
            {label && (
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                Huỷ
              </Button>
            )}
          </div>
        </form>
      )}
    </Panel>
  );
}
