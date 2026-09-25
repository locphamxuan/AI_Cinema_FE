import { Check, Clock, Flag, X } from 'lucide-react';
import type { ProjectMilestone } from '@/types/workflow';
import { useNow } from '@/hooks/useNow';
import { countdownOf, milestoneTimeline, type MilestonePhase } from '@/features/workflow/lib/milestoneClock';

const PHASE: Record<MilestonePhase, { label: string; badge: string; dot: string; Icon: typeof Clock }> = {
  upcoming: {
    label: 'Sắp tới',
    badge: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300',
    dot: 'bg-slate-300 dark:bg-slate-600 text-white',
    Icon: Clock,
  },
  active: {
    label: 'Đang diễn ra',
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300',
    dot: 'bg-purple-600 text-white',
    Icon: Flag,
  },
  done: {
    label: 'Đã kết thúc',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    dot: 'bg-emerald-500 text-white',
    Icon: Check,
  },
  cancelled: {
    label: 'Đã hủy',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    dot: 'bg-rose-400 text-white',
    Icon: X,
  },
};

const formatDay = (date: Date | null) =>
  date ? date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export interface MilestoneTimelineProps {
  milestones: ProjectMilestone[];
  productionStart?: string;
}

/**
 * The project's milestones against the clock, shown on every tab for both the Creator
 * and the Reviewer. Nobody sets a status: it follows the dates and refreshes on its own.
 */
export function MilestoneTimeline({ milestones, productionStart }: MilestoneTimelineProps) {
  const now = useNow();
  const timeline = milestoneTimeline(milestones, productionStart, now);
  const current = timeline.find((t) => t.phase === 'active') ?? timeline.find((t) => t.phase === 'upcoming');

  return (
    <section
      aria-label="Cột mốc dự án"
      className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs p-4 space-y-3"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Cột mốc dự án</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
          {current
            ? `${current.milestone.title}: ${countdownOf(current, now).toLowerCase()}`
            : timeline.length > 0
              ? 'Mọi cột mốc đã kết thúc'
              : 'Trạng thái tự cập nhật theo thời gian'}
        </p>
      </div>

      {timeline.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">Reviewer chưa đặt cột mốc nào cho dự án này.</p>
      ) : (
        <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {timeline.map((item) => {
            const { milestone, phase, startsAt, endsAt, elapsed } = item;
            const { label, badge, dot, Icon } = PHASE[phase];
            const lastDay = endsAt && new Date(endsAt.getTime() - 1);
            return (
              <li
                key={milestone.id}
                aria-current={phase === 'active' ? 'step' : undefined}
                className={`p-3 rounded-lg border text-xs space-y-2 ${
                  phase === 'active' ? 'border-purple-400/60 dark:border-purple-500/40' : 'border-slate-200/80 dark:border-white/10'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${dot}`}>
                    <Icon className="w-3 h-3" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate" title={milestone.title}>
                      {milestone.title}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 tabular-nums">
                      {formatDay(startsAt)} – {formatDay(lastDay)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-md font-medium ${badge}`}>{label}</span>
                  <span className="text-slate-500 dark:text-slate-400 tabular-nums text-right">{countdownOf(item, now)}</span>
                </div>
                {phase === 'active' && (
                  <div
                    role="progressbar"
                    aria-label={`Thời gian đã qua của ${milestone.title}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(elapsed * 100)}
                    className="h-1 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden"
                  >
                    <div className="h-full bg-purple-500 transition-[width] duration-700" style={{ width: `${elapsed * 100}%` }} />
                  </div>
                )}
                {milestone.description && <p className="text-slate-500 dark:text-slate-400 line-clamp-2">{milestone.description}</p>}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
