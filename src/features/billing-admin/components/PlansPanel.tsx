'use client';

import { useState } from 'react';
import { BadgeDollarSign, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { useAction } from '@/features/production/hooks/useAction';
import { useResource } from '@/features/production/hooks/useResource';
import { formatNumber, localDateTimeToIso } from '@/features/production/lib/format';
import { Empty, ErrorNote, Loading, Panel, StatusPill } from '@/features/production/components/shared/ui';
import { billingAdminService } from '@/services/billingAdminService';
import type { AdminPlan, PlanInput, PlanPeriod } from '@/types/billing';

const PERIOD_LABEL: Record<PlanPeriod, string> = { WEEKLY: 'Tuần', MONTHLY: 'Tháng', YEARLY: 'Năm' };
const PERIOD_DAYS: Record<PlanPeriod, number> = { WEEKLY: 7, MONTHLY: 30, YEARLY: 365 };

type Dialog = { mode: 'create' } | { mode: 'edit' | 'price'; plan: AdminPlan };

/** MF-2: the plans Members can join, their Coin price (a new price closes the old one) and visibility. */
export function PlansPanel() {
  const plans = useResource('admin:plans', billingAdminService.listPlans);
  const can = useCan();
  const canPrice = can(PERMISSION.BILLING_PRICE_MANAGE);
  const [dialog, setDialog] = useState<Dialog | null>(null);

  return (
    <Panel
      title="Gói thành viên"
      description="Gói Thường miễn phí cho mọi tài khoản; gói trả phí mở mọi tập đã phát hành trong kỳ và tự gia hạn bằng Coin."
      actions={
        <Button size="sm" onClick={() => setDialog({ mode: 'create' })}>
          <Plus className="w-3.5 h-3.5" /> Thêm gói
        </Button>
      }
    >
      {plans.error && <ErrorNote message={plans.error} onRetry={plans.reload} />}
      {plans.loading && !plans.data && <Loading />}
      {plans.data?.length === 0 && <Empty>Chưa có gói nào.</Empty>}
      {plans.data && plans.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-slate-500 dark:text-slate-400 text-left">
              <tr>
                <th className="py-2 font-medium">Gói</th>
                <th className="py-2 font-medium">Chu kỳ</th>
                <th className="py-2 font-medium text-right">Giá / kỳ</th>
                <th className="py-2 font-medium">Trạng thái</th>
                <th className="py-2 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {plans.data.map((plan) => (
                <tr key={plan.id}>
                  <td className="py-2">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {plan.name} {plan.isFeatured && <span className="text-xs text-amber-600">★ nổi bật</span>}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">{plan.code}</p>
                  </td>
                  <td className="py-2">
                    {PERIOD_LABEL[plan.period]} · {plan.durationDays} ngày
                  </td>
                  <td className="py-2 text-right font-mono">
                    {plan.isFree ? 'Miễn phí' : plan.priceCoins === null ? 'Chưa có giá' : `${formatNumber(plan.priceCoins)} Coin`}
                  </td>
                  <td className="py-2">
                    <StatusPill label={plan.isActive ? 'Đang bán' : 'Đã ẩn'} tone={plan.isActive ? 'emerald' : 'neutral'} />
                  </td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" aria-label={`Sửa ${plan.name}`} onClick={() => setDialog({ mode: 'edit', plan })}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    {canPrice && !plan.isFree && (
                      <Button size="sm" variant="ghost" aria-label={`Đặt giá ${plan.name}`} onClick={() => setDialog({ mode: 'price', plan })}>
                        <BadgeDollarSign className="w-3.5 h-3.5 text-amber-600" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dialog?.mode === 'price' && <PriceModal plan={dialog.plan} onClose={() => setDialog(null)} onDone={plans.reload} />}
      {dialog && dialog.mode !== 'price' && (
        <PlanModal plan={dialog.mode === 'edit' ? dialog.plan : null} onClose={() => setDialog(null)} onDone={plans.reload} />
      )}
    </Panel>
  );
}

interface ModalProps {
  onClose: () => void;
  onDone: () => Promise<void>;
}

function PlanModal({ plan, onClose, onDone }: ModalProps & { plan: AdminPlan | null }) {
  const [form, setForm] = useState({
    code: '',
    name: plan?.name ?? '',
    description: plan?.description ?? '',
    period: 'MONTHLY' as PlanPeriod,
    durationDays: String(plan?.period === 'MONTHLY' ? plan.durationDays : 30),
    sortOrder: String(plan?.sortOrder ?? 0),
    isActive: plan?.isActive ?? true,
    isFeatured: plan?.isFeatured ?? false,
  });
  const { busy, run } = useAction();
  const days = Number(form.durationDays);
  const valid = form.name.trim() && Number.isInteger(days) && days >= 1 && days <= 365 && (plan || form.code.trim().length >= 2);
  const set = (patch: Partial<typeof form>) => setForm({ ...form, ...patch });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input: PlanInput = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      period: form.period,
      durationDays: days,
      sortOrder: Number(form.sortOrder) || 0,
      isFeatured: form.isFeatured,
    };
    const done = plan
      ? await run(() => billingAdminService.updatePlan(plan.id, { ...input, isActive: form.isActive }), 'Đã lưu gói')
      : await run(() => billingAdminService.createPlan({ ...input, code: form.code.trim() }), 'Đã tạo gói - hãy đặt giá để mở bán');
    if (done) {
      await onDone();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={plan ? `Sửa ${plan.name}` : 'Thêm gói thành viên'}>
      <form onSubmit={submit} className="space-y-3">
        {!plan && (
          <FormField label="Mã gói (không đổi được sau khi tạo)">
            <input value={form.code} onChange={(e) => set({ code: e.target.value })} maxLength={50} required className={fieldInputClass} />
          </FormField>
        )}
        <FormField label="Tên gói">
          <input value={form.name} onChange={(e) => set({ name: e.target.value })} maxLength={255} required className={fieldInputClass} />
        </FormField>
        <FormField label="Mô tả">
          <textarea rows={2} value={form.description} onChange={(e) => set({ description: e.target.value })} className={fieldTextareaClass} />
        </FormField>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Chu kỳ">
            <select
              value={form.period}
              onChange={(e) => {
                const period = e.target.value as PlanPeriod;
                set({ period, durationDays: String(PERIOD_DAYS[period]) });
              }}
              className={fieldInputClass}
            >
              <option value="MONTHLY">Tháng</option>
            </select>
          </FormField>
          <FormField label="Số ngày / kỳ">
            <input type="number" min={1} max={365} value={form.durationDays} onChange={(e) => set({ durationDays: e.target.value })} className={fieldInputClass} />
          </FormField>
          <FormField label="Thứ tự hiển thị">
            <input type="number" value={form.sortOrder} onChange={(e) => set({ sortOrder: e.target.value })} className={fieldInputClass} />
          </FormField>
        </div>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => set({ isFeatured: e.target.checked })} className="accent-sky-600" />
          Đánh dấu là gói nổi bật
        </label>
        {plan && (
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set({ isActive: e.target.checked })} className="accent-sky-600" />
            Đang bán (bỏ chọn để ẩn với Member; gói đang chạy vẫn giữ nguyên)
          </label>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={!valid || busy}>
            {plan ? 'Lưu' : 'Tạo gói'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function PriceModal({ plan, onClose, onDone }: ModalProps & { plan: AdminPlan }) {
  const [price, setPrice] = useState(plan.priceCoins ? String(plan.priceCoins) : '');
  const [from, setFrom] = useState('');
  const { busy, run } = useAction();
  const value = Number(price);
  const valid = Number.isInteger(value) && value >= 1;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveFrom = from ? localDateTimeToIso(from) : undefined;
    if (await run(() => billingAdminService.setPlanPrice(plan.id, value, effectiveFrom), 'Đã đặt giá mới')) {
      await onDone();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={`Giá ${plan.name}`} subtitle={plan.priceCoins ? `Giá hiện tại: ${formatNumber(plan.priceCoins)} Coin / kỳ` : 'Gói chưa có giá'}>
      <form onSubmit={submit} className="space-y-3">
        <FormField label="Giá mới (Coin / kỳ)">
          <input type="number" min={1} step={1} value={price} onChange={(e) => setPrice(e.target.value)} required className={fieldInputClass} />
        </FormField>
        <FormField label="Áp dụng từ (để trống = ngay bây giờ)">
          <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className={fieldInputClass} />
        </FormField>
        <p className="text-[11px] text-slate-500">Gói đang chạy giữ giá cũ tới hết kỳ; lần gia hạn sau mới tính giá mới.</p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={!valid || busy}>
            Đặt giá
          </Button>
        </div>
      </form>
    </Modal>
  );
}
