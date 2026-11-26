import { formatDay } from '@/lib/format';
import type { Tone } from '@/features/production/lib/labels';
import type { Policy, PolicyType } from '@/types/policy';

/** Each type in plain words: what it covers and which compliance items the Reviewer checks against it (BE ComplianceService). */
export const POLICY_TYPES: Record<PolicyType, { label: string; purpose: string; usedFor: string }> = {
  AI_LABELING: {
    label: 'Gắn nhãn AI',
    purpose: 'Quy định về nhãn "nội dung do AI tạo" hiện trên video (Điều 44 Luật 134/2025/QH15).',
    usedFor: 'Reviewer làm theo khi gắn nhãn AI cho tập; hệ thống dùng cho mục "Có nhãn AI".',
  },
  CONTENT_POLICY: {
    label: 'An toàn nội dung',
    purpose: 'Những gì tập phim không được chứa: bạo lực cực đoan, khiêu dâm, kích động thù hận, vi phạm pháp luật.',
    usedFor: 'Reviewer đối chiếu khi chấm mục "An toàn nội dung".',
  },
  LEGAL: {
    label: 'Thông báo và người, sự kiện thật',
    purpose: 'Quy định theo Nghị định 142/2026/NĐ-CP: báo rõ khi nội dung dễ gây nhầm lẫn, không mô phỏng người thật.',
    usedFor: 'Reviewer đối chiếu khi chấm mục "Thông báo theo Nghị định 142" và "Không giả mạo người/sự kiện thật".',
  },
};

export const POLICY_TYPE_KEYS = Object.keys(POLICY_TYPES) as PolicyType[];

export const policyTypeLabel = (type: string) => POLICY_TYPES[type as PolicyType]?.label ?? type;

/** Whether the policy counts right now: switched on and inside its dates. */
export function policyState(p: Pick<Policy, 'isActive' | 'effectiveFrom' | 'effectiveTo'>, now = new Date()): { label: string; tone: Tone } {
  if (!p.isActive) return { label: 'Tắt', tone: 'neutral' };
  if (p.effectiveFrom && new Date(p.effectiveFrom) > now) return { label: 'Chưa tới ngày áp dụng', tone: 'amber' };
  if (p.effectiveTo && new Date(p.effectiveTo) <= now) return { label: 'Hết hạn', tone: 'neutral' };
  return { label: 'Đang áp dụng', tone: 'emerald' };
}

/** When a policy applies: from–to, or open-ended. */
export function validity(p: Pick<Policy, 'effectiveFrom' | 'effectiveTo'>): string {
  if (!p.effectiveFrom && !p.effectiveTo) return 'Không thời hạn';
  return `${p.effectiveFrom ? formatDay(p.effectiveFrom) : '…'} – ${p.effectiveTo ? formatDay(p.effectiveTo) : 'nay'}`;
}
