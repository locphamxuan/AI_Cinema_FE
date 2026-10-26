'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/features/production/hooks/useAction';
import { billingAdminService } from '@/services/billingAdminService';
import type { AdminPlan } from '@/types/billing';
import {
  MAX_PLAN_DEVICES,
  MONTHLY_DAYS,
  PLAN_QUALITIES,
  planFormErrors,
  planFormOf,
  planInputOf,
  type PlanForm,
} from '../lib/planForm';

interface Props {
  /** Null creates a new monthly plan. */
  plan: AdminPlan | null;
  onClose: () => void;
  onDone: () => Promise<void>;
}

/** Create or edit a plan: how Members see it, how long a cycle lasts and what it allows (BR-34). */
export function PlanFormModal({ plan, onClose, onDone }: Props) {
  const [form, setForm] = useState<PlanForm>(() => planFormOf(plan));
  // Errors show once a field was touched or the Admin tried to save, not while the form is still empty.
  const [touched, setTouched] = useState<Partial<Record<keyof PlanForm, boolean>>>({});
  const [tried, setTried] = useState(false);
  const { busy, run } = useAction();
  const isFree = plan?.isFree ?? false;
  const errors = planFormErrors(form, { creating: !plan, isFree });
  const errorOf = (key: keyof PlanForm) => ((tried || touched[key]) && errors[key]) || null;
  const set = (patch: Partial<PlanForm>) => {
    setForm((current) => ({ ...current, ...patch }));
    setTouched((current) => ({ ...current, ...Object.fromEntries(Object.keys(patch).map((k) => [k, true])) }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (Object.keys(errors).length) return;
    const input = planInputOf(form, plan);
    const done = plan
      ? await run(() => billingAdminService.updatePlan(plan.id, input), 'Đã lưu gói')
      : await run(() => billingAdminService.createPlan(input), 'Đã tạo gói. Hãy đặt giá để bắt đầu bán.');
    if (done) {
      await onDone();
      onClose();
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={plan ? `Sửa gói ${plan.name}` : 'Thêm gói Tháng'}
      subtitle={isFree ? 'Gói Thường miễn phí: tài khoản nào cũng có, không cần đặt giá.' : 'Gói trả bằng Coin, tự gia hạn mỗi kỳ.'}
    >
      <form onSubmit={submit} noValidate className="space-y-3">
        {!plan && (
          <FormField
            label="Mã gói"
            error={errorOf('code')}
            hint="Dùng để nhận diện gói trong hệ thống, ví dụ premium_thang. Không đổi được sau khi tạo."
          >
            <input value={form.code} onChange={(e) => set({ code: e.target.value })} maxLength={50} className={fieldInputClass} />
          </FormField>
        )}
        <FormField label="Tên gói" error={errorOf('name')} hint="Tên Member thấy trên trang chọn gói.">
          <input value={form.name} onChange={(e) => set({ name: e.target.value })} maxLength={255} className={fieldInputClass} />
        </FormField>
        <FormField label="Mô tả ngắn (không bắt buộc)" error={errorOf('description')}>
          <textarea rows={2} value={form.description} onChange={(e) => set({ description: e.target.value })} className={fieldTextareaClass} />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {!isFree && (
            <FormField
              label="Thời hạn mỗi kỳ (ngày)"
              error={errorOf('durationDays')}
              hint={`Gói Tháng: ${MONTHLY_DAYS.min}–${MONTHLY_DAYS.max} ngày.`}
            >
              <input
                type="number"
                min={MONTHLY_DAYS.min}
                max={MONTHLY_DAYS.max}
                value={form.durationDays}
                onChange={(e) => set({ durationDays: e.target.value })}
                className={fieldInputClass}
              />
            </FormField>
          )}
          <FormField label="Vị trí trên trang chọn gói" error={errorOf('sortOrder')} hint="Số nhỏ hiện trước.">
            <input type="number" min={0} max={999} value={form.sortOrder} onChange={(e) => set({ sortOrder: e.target.value })} className={fieldInputClass} />
          </FormField>
        </div>

        <fieldset className="rounded-xl border border-slate-200 dark:border-white/10 p-3 space-y-3">
          <legend className="px-1 text-xs font-semibold text-slate-700 dark:text-slate-200">Quyền lợi của gói</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Số thiết bị được đăng ký" error={errorOf('maxRegisteredDevices')} hint={`Tối đa ${MAX_PLAN_DEVICES}.`}>
              <input
                type="number"
                min={1}
                max={MAX_PLAN_DEVICES}
                value={form.maxRegisteredDevices}
                onChange={(e) => set({ maxRegisteredDevices: e.target.value })}
                className={fieldInputClass}
              />
            </FormField>
            <FormField label="Số thiết bị xem cùng lúc" error={errorOf('maxConcurrentStreams')} hint="Không vượt số thiết bị được đăng ký.">
              <input
                type="number"
                min={1}
                max={MAX_PLAN_DEVICES}
                value={form.maxConcurrentStreams}
                onChange={(e) => set({ maxConcurrentStreams: e.target.value })}
                className={fieldInputClass}
              />
            </FormField>
            <FormField label="Chất lượng video cao nhất">
              <select value={form.maxQuality} onChange={(e) => set({ maxQuality: e.target.value })} className={fieldInputClass}>
                {PLAN_QUALITIES.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.adFree} onChange={(e) => set({ adFree: e.target.checked })} className="accent-sky-600" />
            Xem không có quảng cáo giữa tập
          </label>
        </fieldset>

        {!isFree && (
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => set({ isFeatured: e.target.checked })} className="accent-sky-600" />
            Gắn nhãn &ldquo;Đề xuất&rdquo; trên trang chọn gói
          </label>
        )}
        {plan && !isFree && (
          <label className="flex items-start gap-2 text-xs">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set({ isActive: e.target.checked })} className="accent-sky-600 mt-0.5" />
            <span>
              Mở bán cho Member
              <span className="block text-[11px] text-slate-500">Bỏ chọn để ẩn gói; người đang dùng vẫn giữ tới hết kỳ đã trả.</span>
            </span>
          </label>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={busy || (tried && Object.keys(errors).length > 0)}>
            {plan ? 'Lưu thay đổi' : 'Tạo gói'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
