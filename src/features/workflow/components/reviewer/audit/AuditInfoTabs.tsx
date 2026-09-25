import { useState } from 'react';
import type { EpisodePackage } from '@/types/workflow';
import { useWorkflowStore } from '@/store/useWorkflowStore';

export interface AuditInfoTabsProps {
  pkg: EpisodePackage;
}

type Tab = 'script' | 'clips' | 'tokens';

const ASSET_LABEL: Record<EpisodePackage['assets'][number]['asset_type'], string> = {
  video: 'Video',
  image: 'Hình ảnh',
  audio: 'Âm thanh',
  text: 'Văn bản',
};

const CARD = 'rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151822]';

/** Reference material for the audit: what was planned, what was rendered, what it cost. */
export function AuditInfoTabs({ pkg }: AuditInfoTabsProps) {
  const overallScript = useWorkflowStore((s) => s.project.overall_script);
  const [tab, setTab] = useState<Tab>('script');

  const usedPercent = pkg.quota_allocated > 0 ? Math.min(100, Math.round((pkg.actual_tokens_used / pkg.quota_allocated) * 100)) : 0;
  const tabs: Array<[Tab, string]> = [
    ['script', 'Kịch bản'],
    ['clips', `Clip (${pkg.assets.length})`],
    ['tokens', 'Token'],
  ];

  return (
    <div className={CARD}>
      <div role="tablist" aria-label="Thông tin tập phim" className="flex gap-5 px-5 border-b border-slate-200 dark:border-white/10">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`py-3 -mb-px text-sm font-medium border-b-2 transition cursor-pointer focus-visible:outline-none focus-visible:text-purple-600 ${
              tab === key
                ? 'border-purple-600 text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="p-5 text-sm">
        {tab === 'script' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Kịch bản tổng thể</h3>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{overallScript || 'Chưa có kịch bản tổng thể.'}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Các cảnh</h3>
              <ol className="divide-y divide-slate-100 dark:divide-white/5">
                {pkg.brief.scene_breakdown.map((sc) => (
                  <li key={sc.scene_number} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex justify-between gap-3">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {sc.scene_number}. {sc.title}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 tabular-nums">
                        {sc.target_duration_sec} giây · {sc.estimated_tokens} token
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">{sc.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {tab === 'clips' && (
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {pkg.assets.map((asset) => (
              <li key={asset.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">
                    Cảnh {pkg.jobs.find((j) => j.id === asset.job_id)?.scene_number ?? '?'} · {ASSET_LABEL[asset.asset_type]}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{asset.prompt}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-right shrink-0 tabular-nums">
                  {asset.duration_seconds !== null && `${asset.duration_seconds} giây`}
                  <span className="block">{asset.model}</span>
                </p>
              </li>
            ))}
            {pkg.assets.length === 0 && <li className="text-slate-500 dark:text-slate-400">Chưa có clip nào được tạo.</li>}
          </ul>
        )}

        {tab === 'tokens' && (
          <div className="space-y-5">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Đã dùng</span>
                <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                  {pkg.actual_tokens_used} / {pkg.quota_allocated} token
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                <div className={`h-full rounded-full ${usedPercent >= 90 ? 'bg-amber-500' : 'bg-purple-500'}`} style={{ width: `${usedPercent}%` }} />
              </div>
              {usedPercent >= 90 && <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">Đã dùng hơn 90% số token được cấp.</p>}
            </div>

            <ul className="divide-y divide-slate-100 dark:divide-white/5">
              {pkg.jobs.map((job) => (
                <li key={job.id} className="flex justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="text-slate-800 dark:text-slate-200 truncate">{job.title}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 tabular-nums">{job.token_cost} token</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
