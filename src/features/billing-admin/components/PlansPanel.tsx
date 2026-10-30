'use client';

import { useState } from 'react';
import { BadgeDollarSign, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import { useAction } from '@/features/production/hooks/useAction';
import { useResource } from '@/features/production/hooks/useResource';
import { formatNumber, localDateTimeToIso } from '@/features/production/lib/format';
import { Empty, ErrorNote, Loading, Panel, StatusPill } from '@/features/production/components/shared/ui';
import { billingAdminService } from '@/services/billingAdminService';
import type { AdminPlan, PlanPeriod } from '@/types/billing';
import { featuresSummary, MAX_PLAN_PRICE_COINS, priceError } from '../lib/planForm';
import { PlanFormModal } from './PlanFormModal';
import { Pager, pageOf } from '@/features/production/components/shared/Pager';

const PERIOD_LABEL: Record<PlanPeriod, string> = { WEEKLY: 'Tuần', MONTHLY: 'Tháng', YEARLY: 'Năm' };

type Dialog = { mode: 'create' } | { mode: 'edit' | 'price'; plan: AdminPlan };

/** MF-2: the plans Members can join, their Coin price (a new price closes the old one) and visibility. */
export function PlansPanel() {
  const plans = useResource('admin:plans', billingAdminService.listPlans);
  const can = useCan();
  const canPrice = can(PERMISSION.BILLING_PRICE_MANAGE);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [page, setPage] = useState(1);
  const paged = pageOf(plans.data ?? [], page, 10);

  return (
    <Panel
      title="Gói thành viên"
      description="Gói Thường miễn phí, tài khoản nào cũng có. Gói Tháng trả bằng Coin, mở mọi tập đã phát hành trong thời hạn gói và tự gia hạn mỗi kỳ."
      actions={
        <Button size="sm" onClick={() => setDialog({ mode: 'create' })}>
          Thêm gói Tháng
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
                <th className="py-2 font-medium">Thời hạn</th>
                <th className="py-2 font-medium text-right">Giá mỗi kỳ</th>
                <th className="py-2 font-medium pl-4">Quyền lợi</th>
                <th className="py-2 font-medium">Trạng thái</th>
                <th className="py-2 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {paged.rows.map((plan) => (
                <tr key={plan.id}>
                  <td className="py-2">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {plan.name} {plan.isFeatured && <span className="text-xs text-amber-600">Đề xuất</span>}
                    </p>
                    <p className="text-[11px] text-slate-500 tabular-nums">{plan.code}</p>
                  </td>
                  <td className="py-2">{plan.isFree ? 'Không thời hạn' : `${PERIOD_LABEL[plan.period]} · ${plan.durationDays} ngày`}</td>
                  <td className="py-2 text-right tabular-nums">
                    {plan.isFree ? 'Miễn phí' : plan.priceCoins === null ? 'Chưa đặt giá' : `${formatNumber(plan.priceCoins)} Coin`}
                  </td>
                  <td className="py-2 pl-4 text-slate-600 dark:text-slate-300">{featuresSummary(plan.features) || 'Theo mặc định'}</td>
                  <td className="py-2">
                    <StatusPill
                      label={!plan.isActive ? 'Đang ẩn' : plan.isFree || plan.priceCoins !== null ? 'Đang mở bán' : 'Chờ đặt giá'}
                      tone={!plan.isActive ? 'neutral' : plan.isFree || plan.priceCoins !== null ? 'emerald' : 'amber'}
                    />
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
          <Pager page={page} totalPages={paged.totalPages} onChange={setPage} className="px-4 pb-4" />
        </div>
      )}

      {dialog?.mode === 'price' && <PriceModal plan={dialog.plan} onClose={() => setDialog(null)} onDone={plans.reload} />}
      {dialog && dialog.mode !== 'price' && (
        <PlanFormModal plan={dialog.mode === 'edit' ? dialog.plan : null} onClose={() => setDialog(null)} onDone={plans.reload} />
      )}
    </Panel>
  );
}

interface ModalProps {
  onClose: () => void;
  onDone: () => Promise<void>;
}

function PriceModal({ plan, onClose, onDone }: ModalProps & { plan: AdminPlan }) {
  const [price, setPrice] = useState(plan.priceCoins ? String(plan.priceCoins) : '');
  const [from, setFrom] = useState('');
  const { busy, run } = useAction();
  const value = Number(price);
  const error = price === '' && !from ? null : priceError(price, from);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveFrom = from ? localDateTimeToIso(from) : undefined;
    if (await run(() => billingAdminService.setPlanPrice(plan.id, value, effectiveFrom), 'Đã đặt giá mới')) {
      await onDone();
      onClose();
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Đặt giá gói ${plan.name}`}
      subtitle={plan.priceCoins ? `Giá đang áp dụng: ${formatNumber(plan.priceCoins)} Coin mỗi kỳ` : 'Gói chưa có giá nên Member chưa mua được.'}
    >
      <form onSubmit={submit} className="space-y-3">
        <FormField label="Giá mới (Coin / kỳ)" error={error} hint={`Từ 1 đến ${formatNumber(MAX_PLAN_PRICE_COINS)} Coin.`}>
          <input type="number" min={1} max={MAX_PLAN_PRICE_COINS} step={1} value={price} onChange={(e) => setPrice(e.target.value)} required className={fieldInputClass} />
        </FormField>
        <FormField label="Bắt đầu áp dụng" hint="Để trống để áp dụng ngay.">
          <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className={fieldInputClass} />
        </FormField>
        <p className="text-[11px] text-slate-500">Người đang dùng gói giữ giá cũ tới hết kỳ đã trả; từ lần gia hạn sau mới tính giá mới.</p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={price === '' || !!error || busy}>
            Đặt giá
          </Button>
        </div>
      </form>
    </Modal>
  );
}
