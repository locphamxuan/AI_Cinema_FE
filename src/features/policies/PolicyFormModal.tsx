'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { policyService, type PolicyInput } from '@/services/policyService';
import type { Policy, PolicyType } from '@/types/policy';
import { POLICY_TYPE_KEYS, POLICY_TYPES } from './policyLabels';

/** Same limit as the BE `CreatePolicyDto.content`. */
export const CONTENT_MAX = 20000;

/** ISO instant → the `YYYY-MM-DDTHH:mm` local value a datetime-local input shows. */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** datetime-local value → ISO instant, or null when the field is empty (no time limit). */
export function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

interface PolicyFormModalProps {
  policy: Policy | null;
  onClose: () => void;
  onDone: () => Promise<void>;
}

/** Create or edit one policy. The content is ordinary text; on/off is switched from the list. */
export function PolicyFormModal({ policy, onClose, onDone }: PolicyFormModalProps) {
  const [name, setName] = useState(policy?.name ?? '');
  const [type, setType] = useState<PolicyType>(policy?.type ?? 'AI_LABELING');
  const [content, setContent] = useState(policy?.content ?? '');
  const [reference, setReference] = useState(policy?.documentReference ?? '');
  const [version, setVersion] = useState(policy?.version ?? '1.0');
  const [from, setFrom] = useState(toLocalInput(policy?.effectiveFrom));
  const [to, setTo] = useState(toLocalInput(policy?.effectiveTo));
  const [activate, setActivate] = useState(true);
  const { busy, run } = useAction();

  const effectiveFrom = fromLocalInput(from);
  const effectiveTo = fromLocalInput(to);
  const rangeBad = Boolean(effectiveFrom && effectiveTo && effectiveTo <= effectiveFrom);
  const valid = name.trim() && version.trim() && content.trim() && content.length <= CONTENT_MAX && !rangeBad;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const input: PolicyInput = {
      name: name.trim(),
      type,
      version: version.trim(),
      documentReference: reference.trim() || null,
      content: content.trim(),
      effectiveFrom,
      effectiveTo,
      ...(policy ? {} : { isActive: activate }),
    };
    const done = policy
      ? await run(() => policyService.update(policy.id, input), 'Đã lưu chính sách')
      : await run(() => policyService.create(input), 'Đã thêm chính sách');
    if (done) {
      await onDone();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} maxWidth="max-w-2xl" title={policy ? 'Sửa chính sách' : 'Thêm chính sách'}>
      <form onSubmit={submit} className="space-y-4 pt-1">
        <FormField label="Tiêu đề">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={255}
            required
            className={fieldInputClass}
            placeholder="Ví dụ: Quy định gắn nhãn nội dung do AI tạo"
          />
        </FormField>

        <FormField label="Loại chính sách" hint={`${POLICY_TYPES[type].purpose} ${POLICY_TYPES[type].usedFor}`}>
          <select value={type} onChange={(e) => setType(e.target.value as PolicyType)} className={fieldInputClass}>
            {POLICY_TYPE_KEYS.map((key) => (
              <option key={key} value={key}>
                {POLICY_TYPES[key].label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Nội dung"
          hint={`Viết như văn bản thường. Mỗi ý một dòng; dòng bắt đầu bằng "- " sẽ thành gạch đầu dòng. ${content.length}/${CONTENT_MAX} ký tự.`}
          error={content.length > CONTENT_MAX ? `Nội dung dài quá ${CONTENT_MAX} ký tự.` : null}
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            required
            className={fieldTextareaClass}
            placeholder={'Ví dụ:\nMọi tập có phần do AI tạo phải gắn nhãn rõ ràng.\n- Nhãn hiện trên màn hình suốt tập phim.\n- Không được che hoặc làm mờ nhãn.'}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
          <FormField label="Căn cứ pháp lý (không bắt buộc)">
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              maxLength={1000}
              className={fieldInputClass}
              placeholder="Ví dụ: Điều 44 Luật số 134/2025/QH15"
            />
          </FormField>
          <FormField label="Phiên bản">
            <input value={version} onChange={(e) => setVersion(e.target.value)} maxLength={50} required className={fieldInputClass} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Áp dụng từ" hint="Để trống nếu áp dụng ngay.">
            <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className={fieldInputClass} />
          </FormField>
          <FormField
            label="Áp dụng đến"
            hint="Để trống nếu không có ngày kết thúc."
            error={rangeBad ? 'Ngày kết thúc phải sau ngày bắt đầu.' : null}
          >
            <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className={fieldInputClass} />
          </FormField>
        </div>

        {!policy && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={activate} onChange={(e) => setActivate(e.target.checked)} className="size-4" />
            Bật áp dụng ngay sau khi lưu
          </label>
        )}

        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={!valid || busy}>
            {busy ? 'Đang lưu…' : policy ? 'Lưu thay đổi' : 'Thêm chính sách'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
