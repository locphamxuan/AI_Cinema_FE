'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { policyService, type PolicyInput } from '@/services/policyService';
import type { Policy, PolicyType } from '@/types/policy';
import { POLICY_TYPE } from './policyLabels';

const SELECT = `${fieldInputClass} py-1.5 text-xs`;

interface PolicyFormModalProps {
  policy: Policy | null;
  onClose: () => void;
  onDone: () => Promise<void>;
}

export function PolicyFormModal({ policy, onClose, onDone }: PolicyFormModalProps) {
  const [form, setForm] = useState<PolicyInput>({
    name: policy?.name ?? '',
    type: policy?.type ?? 'AI_LABELING',
    version: policy?.version ?? '',
    documentReference: policy?.documentReference ?? '',
    content: policy?.content ?? null,
    effectiveFrom: policy?.effectiveFrom ?? '',
    effectiveTo: policy?.effectiveTo ?? '',
    isActive: policy?.isActive ?? true,
  });
  const { busy, run } = useAction();

  const set = (patch: Partial<PolicyInput>) => setForm({ ...form, ...patch });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = policy
      ? await run(() => policyService.update(policy.id, form), 'Đã cập nhật chính sách')
      : await run(() => policyService.create(form), 'Đã tạo chính sách');
    if (done) {
      await onDone();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} maxWidth="max-w-2xl" title={policy ? 'Sửa chính sách' : 'Tạo chính sách mới'}>
      <form onSubmit={submit} className="space-y-4 pt-1">
        <FormField label="Tên chính sách">
          <input
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            maxLength={255}
            required
            className={fieldInputClass}
            placeholder="Ví dụ: Quy định gắn nhãn AI"
          />
        </FormField>

        <FormField label="Loại chính sách">
          <select
            value={form.type}
            onChange={(e) => set({ type: e.target.value as PolicyType })}
            required
            className={SELECT}
          >
            {Object.entries(POLICY_TYPE).map(([key, label]) => (
              <option key={key} value={key as PolicyType}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Phiên bản">
          <input
            value={form.version}
            onChange={(e) => set({ version: e.target.value })}
            maxLength={50}
            required
            className={fieldInputClass}
            placeholder="Ví dụ: 1.0.0"
          />
        </FormField>

        <FormField label="Văn bản pháp lý tham khảo">
          <input
            value={form.documentReference ?? ''}
            onChange={(e) => set({ documentReference: e.target.value || null })}
            maxLength={1000}
            className={fieldInputClass}
            placeholder="Ví dụ: Điều 44 Luật số 134/2025/QH15"
          />
        </FormField>

        <FormField label="Nội dung và yêu cầu (JSON)">
          <textarea
            value={form.content ? JSON.stringify(form.content, null, 2) : ''}
            onChange={(e) => {
              try {
                set({ content: e.target.value ? JSON.parse(e.target.value) : null });
              } catch {
                // Bỏ qua nếu JSON chưa hợp lệ, người dùng đang nhập
              }
            }}
            rows={6}
            className={`${fieldInputClass} font-mono text-xs`}
            placeholder='Ví dụ: { "requiredLabel": "AI-generated", "minAge": 18 }'
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Nội dung có cấu trúc cho nhãn AI và kiểm tra tuân thủ tham chiếu. Để trống nếu không có.
          </p>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Hiệu lực từ">
            <input
              type="datetime-local"
              value={form.effectiveFrom ?? ''}
              onChange={(e) => set({ effectiveFrom: e.target.value || null })}
              className={fieldInputClass}
            />
          </FormField>
          <FormField label="Hiệu lực đến">
            <input
              type="datetime-local"
              value={form.effectiveTo ?? ''}
              onChange={(e) => set({ effectiveTo: e.target.value || null })}
              className={fieldInputClass}
            />
          </FormField>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            type="checkbox"
            checked={form.isActive ?? true}
            onChange={(e) => set({ isActive: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-foreground">
            Đang áp dụng
          </label>
          <p className="ml-auto text-xs text-muted-foreground">
            Khi tắt, chính sách này sẽ không còn được áp dụng cho nhãn AI và kiểm tra tuân thủ.
          </p>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-xl px-4 text-xs font-semibold">
            Huỷ
          </Button>
          <Button type="submit" disabled={!form.name.trim() || !form.version.trim() || busy} className="rounded-xl px-5 text-xs font-bold">
            {busy ? 'Đang lưu…' : policy ? 'Cập nhật' : 'Tạo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
