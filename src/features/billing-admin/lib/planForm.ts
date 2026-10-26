import type { AdminPlan, PlanFeatures, PlanInput } from '@/types/billing';

/** The same bounds the BE checks (membership-plan DTOs), so the form explains before it sends. */
export const MONTHLY_DAYS = { min: 28, max: 31 } as const;
export const MAX_PLAN_DEVICES = 10;
export const MAX_PLAN_PRICE_COINS = 100_000;
export const PLAN_QUALITIES = ['360p', '720p', '1080p'] as const;
const CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

/** What a new plan starts with: the Free plan's limits, so nothing is given away by accident. */
const NEW_PLAN_FEATURES = { maxRegisteredDevices: 2, maxConcurrentStreams: 1, adFree: false, maxQuality: '720p' };

export interface PlanForm {
  code: string;
  name: string;
  description: string;
  durationDays: string;
  sortOrder: string;
  isActive: boolean;
  isFeatured: boolean;
  maxRegisteredDevices: string;
  maxConcurrentStreams: string;
  adFree: boolean;
  maxQuality: string;
}

export type PlanFormErrors = Partial<Record<keyof PlanForm, string>>;

const numberOf = (value: unknown, fallback: number) => (typeof value === 'number' ? value : fallback);

export function planFormOf(plan: AdminPlan | null): PlanForm {
  const features = (plan?.features ?? {}) as PlanFeatures;
  return {
    code: plan?.code ?? '',
    name: plan?.name ?? '',
    description: plan?.description ?? '',
    durationDays: String(plan?.durationDays ?? 30),
    sortOrder: String(plan?.sortOrder ?? 0),
    isActive: plan?.isActive ?? true,
    isFeatured: plan?.isFeatured ?? false,
    maxRegisteredDevices: String(numberOf(features.maxRegisteredDevices, NEW_PLAN_FEATURES.maxRegisteredDevices)),
    maxConcurrentStreams: String(numberOf(features.maxConcurrentStreams, NEW_PLAN_FEATURES.maxConcurrentStreams)),
    adFree: typeof features.adFree === 'boolean' ? features.adFree : NEW_PLAN_FEATURES.adFree,
    maxQuality: features.maxQuality ?? NEW_PLAN_FEATURES.maxQuality,
  };
}

const wholeIn = (raw: string, min: number, max: number) => {
  const n = Number(raw);
  return raw.trim() !== '' && Number.isInteger(n) && n >= min && n <= max;
};

/** One message per field that would be refused; empty when the form can be sent. */
export function planFormErrors(form: PlanForm, { creating, isFree }: { creating: boolean; isFree: boolean }): PlanFormErrors {
  const errors: PlanFormErrors = {};
  if (creating) {
    const code = form.code.trim();
    if (code.length < 2 || code.length > 50) errors.code = 'Mã gói cần từ 2 đến 50 ký tự.';
    else if (!CODE_PATTERN.test(code)) errors.code = 'Chỉ dùng chữ không dấu, số, dấu _ hoặc -, không có khoảng trắng.';
  }
  if (!form.name.trim()) errors.name = 'Hãy nhập tên gói.';
  if (form.description.length > 1000) errors.description = 'Mô tả tối đa 1000 ký tự.';
  if (!isFree && !wholeIn(form.durationDays, MONTHLY_DAYS.min, MONTHLY_DAYS.max)) {
    errors.durationDays = `Gói Tháng kéo dài từ ${MONTHLY_DAYS.min} đến ${MONTHLY_DAYS.max} ngày.`;
  }
  if (!wholeIn(form.sortOrder, 0, 999)) errors.sortOrder = 'Nhập số nguyên từ 0 đến 999.';
  if (!wholeIn(form.maxRegisteredDevices, 1, MAX_PLAN_DEVICES)) {
    errors.maxRegisteredDevices = `Nhập từ 1 đến ${MAX_PLAN_DEVICES} thiết bị.`;
  }
  if (!wholeIn(form.maxConcurrentStreams, 1, MAX_PLAN_DEVICES)) {
    errors.maxConcurrentStreams = `Nhập từ 1 đến ${MAX_PLAN_DEVICES} thiết bị.`;
  } else if (!errors.maxRegisteredDevices && Number(form.maxConcurrentStreams) > Number(form.maxRegisteredDevices)) {
    errors.maxConcurrentStreams = 'Không được nhiều hơn số thiết bị được đăng ký.';
  }
  return errors;
}

/** The request body of a valid form; the code only goes out on create, the length never for the Free plan. */
export function planInputOf(form: PlanForm, plan: AdminPlan | null): PlanInput {
  return {
    ...(plan ? { isActive: form.isActive } : { code: form.code.trim(), period: 'MONTHLY' }),
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    ...(plan?.isFree ? {} : { durationDays: Number(form.durationDays) }),
    sortOrder: Number(form.sortOrder),
    isFeatured: form.isFeatured,
    features: {
      maxRegisteredDevices: Number(form.maxRegisteredDevices),
      maxConcurrentStreams: Number(form.maxConcurrentStreams),
      adFree: form.adFree,
      maxQuality: form.maxQuality,
    },
  };
}

/** "4 thiết bị · xem cùng lúc 2 · không quảng cáo · tối đa 1080p" for the plan table; empty when unset. */
export function featuresSummary(features: AdminPlan['features']): string {
  const f = (features ?? {}) as PlanFeatures;
  const parts = [
    f.maxRegisteredDevices ? `${f.maxRegisteredDevices} thiết bị` : null,
    f.maxConcurrentStreams ? `xem cùng lúc ${f.maxConcurrentStreams}` : null,
    f.adFree === undefined ? null : f.adFree ? 'không quảng cáo' : 'có quảng cáo',
    f.maxQuality ? `tối đa ${f.maxQuality}` : null,
  ];
  return parts.filter(Boolean).join(' · ');
}

/** Why a new price cannot be saved, or null. `from` is the datetime-local value, empty = now. */
export function priceError(price: string, from: string, now = Date.now()): string | null {
  if (!wholeIn(price, 1, MAX_PLAN_PRICE_COINS)) return `Giá là số nguyên từ 1 đến ${MAX_PLAN_PRICE_COINS.toLocaleString('vi-VN')} Coin.`;
  if (from && new Date(from).getTime() < now) return 'Chọn thời điểm từ bây giờ trở đi; giá không áp dụng lùi về trước.';
  return null;
}
