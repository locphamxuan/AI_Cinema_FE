import { Zap } from 'lucide-react';
import type { EpisodePackage } from '@/types/workflow';
import { quotaUsage } from '@/features/workflow/lib/quota';
import { QuotaRequestPanel } from './QuotaRequestPanel';

export interface TokensTabProps {
  currentPackage: EpisodePackage;
}

export function TokensTab({ currentPackage }: TokensTabProps) {
  const usage = quotaUsage(currentPackage);

  return (
    <div className="bg-white dark:bg-[#161922] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Token đã dùng</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Số token Reviewer đã cấp cho tập này</p>
          </div>
        </div>
        <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">
          {usage.used} / {usage.allocated} token
        </span>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
          <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
            <span>Đã dùng:</span>
            <span className="font-bold font-mono">{usage.percent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${usage.isWarning ? 'bg-rose-500' : 'bg-amber-500'}`}
              style={{ width: `${usage.percent}%` }}
            />
          </div>
          {usage.isWarning && (
            <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">
              Sắp hết token (còn {usage.remaining}). Bạn có thể xin thêm ở bên dưới.
            </p>
          )}
        </div>

        <QuotaRequestPanel currentPackage={currentPackage} />

        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Các cảnh</h4>
        <div className="space-y-2">
          {currentPackage.jobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{job.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{job.generation_steps.length} prompt</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{job.token_cost} token</span>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {job.status === 'completed' ? 'Đã tạo xong' : 'Chưa tạo'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
