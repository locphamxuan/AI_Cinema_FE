import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { EpisodePackage, ProductionProject } from '@/types/workflow';
import { StatusBadge } from '../../shared/StatusBadge';

export interface ReviewerOverviewTabProps {
  project: ProductionProject;
  pendingPlanCount: number;
  submittedCount: number;
  onReviewPlan: (episodeId: string) => void;
}

const CARD = 'bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs';
const PRIMARY_ACTION =
  'px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs transition active:scale-95 cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50';
const SECONDARY_ACTION =
  'px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 font-medium text-xs transition cursor-pointer inline-flex items-center gap-1.5';

function Stat({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className={`${CARD} p-4`}>
      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`text-xl font-bold font-mono mt-1 tabular-nums ${highlight ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>{value}</p>
    </div>
  );
}

/** The one action an episode needs from the Reviewer right now, if any. */
function EpisodeAction({ episode, onReviewPlan }: { episode: EpisodePackage; onReviewPlan: (episodeId: string) => void }) {
  switch (episode.status) {
    case 'PLAN_PENDING':
      return (
        <button type="button" onClick={() => onReviewPlan(episode.id)} className={PRIMARY_ACTION}>
          Duyệt kế hoạch <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </button>
      );
    case 'EPISODE_SUBMITTED':
    case 'COMPLIANCE_PASSED':
      return (
        <Link href={`/reviewer/audit/${episode.id}`} className={PRIMARY_ACTION}>
          Thẩm định <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      );
    case 'PUBLISHED':
      return (
        <Link href={`/watch/${episode.id}`} className={SECONDARY_ACTION}>
          Xem OTT
        </Link>
      );
    default:
      return <span className="text-slate-300 dark:text-slate-600">—</span>;
  }
}

export function OverviewTab({ project, pendingPlanCount, submittedCount, onReviewPlan }: ReviewerOverviewTabProps) {
  const publishedCount = project.episodes.filter((e) => e.status === 'PUBLISHED').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Chờ duyệt kế hoạch" value={pendingPlanCount} highlight={pendingPlanCount > 0} />
        <Stat label="Chờ thẩm định video" value={submittedCount} highlight={submittedCount > 0} />
        <Stat label="Đã xuất bản" value={`${publishedCount} / ${project.total_episodes}`} />
        <Stat label="Token đã cấp" value={`${project.consumed_tokens} / ${project.allocated_tokens}`} />
      </div>

      <section className={`${CARD} overflow-hidden`} aria-label="Danh sách tập phim">
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-white/10">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Các tập phim</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/10 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th scope="col" className="py-2.5 px-5">Tập</th>
                <th scope="col" className="py-2.5 px-4">Trạng thái</th>
                <th scope="col" className="py-2.5 px-4">Token</th>
                <th scope="col" className="py-2.5 px-5 text-right">
                  <span className="sr-only">Hành động</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
              {project.episodes.map((ep) => {
                const quota = ep.quota_allocated || ep.brief.estimated_tokens || 1;
                const tokenPercent = Math.min(100, Math.round((ep.actual_tokens_used / quota) * 100));

                return (
                  <tr key={ep.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-5">
                      <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[240px]">
                        Tập {ep.episode_number}: {ep.title.replace(/^Tập \d+:\s*/, '')}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{ep.brief.scene_breakdown.length} phân cảnh</p>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={ep.status} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-28 space-y-1">
                        <p className="font-mono text-[11px] tabular-nums text-slate-700 dark:text-slate-300">
                          {ep.actual_tokens_used} <span className="text-slate-400">/ {ep.quota_allocated || '—'}</span>
                        </p>
                        <div className="w-full bg-slate-100 dark:bg-white/10 h-1 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${ep.actual_tokens_used > quota ? 'bg-rose-500' : 'bg-purple-500'}`} style={{ width: `${tokenPercent}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      <EpisodeAction episode={ep} onReviewPlan={onReviewPlan} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
