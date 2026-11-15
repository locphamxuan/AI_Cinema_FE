import { formatDay } from '@/lib/format';
import type { Policy, PolicyType } from '@/types/policy';

export const POLICY_TYPE: Record<PolicyType, string> = {
  AI_LABELING: 'Gắn nhãn AI',
  CONTENT_POLICY: 'Nội dung',
  COPYRIGHT: 'Bản quyền',
  LEGAL: 'Pháp lý',
  PUBLISHING: 'Phát hành',
};

/** When a policy applies: from–to, or open-ended. */
export function validity(p: Pick<Policy, 'effectiveFrom' | 'effectiveTo'>): string {
  if (!p.effectiveFrom && !p.effectiveTo) return 'Không thời hạn';
  return `${p.effectiveFrom ? formatDay(p.effectiveFrom) : '…'} – ${p.effectiveTo ? formatDay(p.effectiveTo) : 'nay'}`;
}
