import { Badge } from '@/components/ui/Badge';
import type { WorkflowState } from '@/types/workflow';

const STATUS_CONFIG: Record<WorkflowState, { label: string; tone: 'neutral' | 'amber' | 'emerald' | 'blue' | 'purple' | 'rose' }> = {
  PLAN_DRAFT: { label: 'Đang soạn kế hoạch', tone: 'neutral' },
  PLAN_PENDING: { label: 'Chờ duyệt kế hoạch', tone: 'amber' },
  QUOTA_ALLOCATED: { label: 'Đã cấp token', tone: 'emerald' },
  IN_PRODUCTION: { label: 'Đang sản xuất', tone: 'blue' },
  EPISODE_SUBMITTED: { label: 'Chờ kiểm định', tone: 'purple' },
  CHANGES_REQUESTED: { label: 'Cần chỉnh sửa', tone: 'rose' },
  COMPLIANCE_PASSED: { label: 'Đã kiểm định', tone: 'emerald' },
  PUBLISHED: { label: 'Đã phát hành', tone: 'emerald' },
};

export interface StatusBadgeProps {
  status: WorkflowState | string;
  className?: string;
}

/** Maps an episode's WorkflowState to a consistent label + color, shared by the nav header pill, sidebar dots, and status displays across both dashboards. */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as WorkflowState] ?? { label: status, tone: 'neutral' as const };
  return (
    <Badge tone={config.tone} dot className={className}>
      {config.label}
    </Badge>
  );
}

const DOT_TONE: Record<WorkflowState, string> = {
  PLAN_DRAFT: 'bg-slate-400',
  PLAN_PENDING: 'bg-amber-500',
  QUOTA_ALLOCATED: 'bg-emerald-500',
  IN_PRODUCTION: 'bg-blue-500',
  EPISODE_SUBMITTED: 'bg-purple-500',
  CHANGES_REQUESTED: 'bg-rose-500 animate-pulse',
  COMPLIANCE_PASSED: 'bg-emerald-500',
  PUBLISHED: 'bg-emerald-500',
};

/** Just the colored dot (no label) — used in compact episode-list rows. */
export function statusDotClass(status: WorkflowState | string): string {
  return DOT_TONE[status as WorkflowState] ?? 'bg-slate-400';
}
