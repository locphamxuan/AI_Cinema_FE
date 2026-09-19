import { useState } from 'react';
import { FileText, Layers, Zap, AlertTriangle } from 'lucide-react';
import type { EpisodePackage } from '@/types/workflow';

export interface AuditInfoTabsProps {
  pkg: EpisodePackage;
}

type Tab = 'brief' | 'assets' | 'tokens';

export function AuditInfoTabs({ pkg }: AuditInfoTabsProps) {
  const [tab, setTab] = useState<Tab>('brief');
  const tokenPercentage = pkg.quota_allocated > 0 ? Math.min(100, Math.round((pkg.actual_tokens_used / pkg.quota_allocated) * 100)) : 0;
  const isTokenWarning = tokenPercentage >= 90;

  return (
    <div className="bg-white dark:bg-[#161922] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
        {(
          [
            ['brief', 'Kịch bản gốc (Content Brief)', FileText],
            ['assets', `Asset AI (${pkg.assets.length})`, Layers],
            ['tokens', `Tiêu hao Token (${pkg.actual_tokens_used}/${pkg.quota_allocated})`, Zap],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              tab === key ? 'bg-purple-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'brief' && (
        <div className="space-y-3 text-xs">
          <div>
            <h4 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Kịch bản tổng thể:</h4>
            <p className="text-slate-800 dark:text-white bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5 leading-relaxed">
              {pkg.brief.overview_script}
            </p>
          </div>
          <div>
            <h4 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Danh sách phân cảnh:</h4>
            <div className="space-y-2">
              {pkg.brief.scene_breakdown.map((sc) => (
                <div key={sc.scene_number} className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-purple-700 dark:text-purple-400">
                      Cảnh {sc.scene_number}: {sc.title}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {sc.target_duration_sec}s · {sc.estimated_tokens} Tokens
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{sc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'assets' && (
        <div className="space-y-3">
          {pkg.assets.map((asset, idx) => (
            <div
              key={asset.id}
              className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- external mock CDN thumbnail, not a static asset */}
              <img
                src={asset.thumbnail_url}
                alt="Asset thumbnail"
                width={80}
                height={48}
                loading="lazy"
                className="w-20 h-12 object-cover rounded-lg border border-slate-200 dark:border-white/10"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-slate-900 dark:text-white">Clip Phân cảnh #{idx + 1}</h5>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">{asset.resolution}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 truncate text-[11px] font-mono mt-0.5">
                  Model: {asset.metadata.model} · Seed: {asset.metadata.seed} · FPS: {asset.metadata.fps}
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-1 italic mt-1">&quot;{asset.metadata.prompt}&quot;</p>
              </div>
              <div className="text-right text-slate-500 dark:text-slate-400 text-[11px]">
                <div>{asset.duration_seconds}s</div>
                <div>{asset.file_size_mb} MB</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'tokens' && (
        <div className="space-y-4 text-xs">
          <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Mức tiêu hao thực tế:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {pkg.actual_tokens_used} / {pkg.quota_allocated} Tokens
              </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-black/50 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isTokenWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${tokenPercentage}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Tỷ lệ sử dụng: {tokenPercentage}%</span>
              <span>Còn lại: {Math.max(0, pkg.quota_allocated - pkg.actual_tokens_used)} Tokens</span>
            </div>

            {isTokenWarning && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Cảnh báo: Đã sử dụng vượt quá 90% hạn mức token được cấp!</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-slate-700 dark:text-slate-300">Chi tiết tác vụ sinh tài nguyên:</h5>
            {pkg.jobs.map((job) => (
              <div key={job.id} className="flex justify-between items-center bg-slate-50 dark:bg-black/20 p-2.5 rounded-lg border border-slate-200 dark:border-white/5">
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">{job.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{job.generation_steps.length} prompt</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{job.token_cost} Tokens</span>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Đã hoàn tất 100%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
