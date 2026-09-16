import { Zap } from 'lucide-react';
import type { EpisodePackage } from '@/types/workflow';

export interface TokensTabProps {
  currentPackage: EpisodePackage;
  quotaPercent: number;
  isQuotaWarning: boolean;
}

export function TokensTab({ currentPackage, quotaPercent, isQuotaWarning }: TokensTabProps) {
  const quotaFillPercent =
    currentPackage.quota_allocated > 0 ? Math.min(100, (currentPackage.actual_tokens_used / currentPackage.quota_allocated) * 100) : 0;

  return (
    <div className="bg-white dark:bg-[#161922] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Chi Tiết Tiêu Hao Token AI</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Hạn mức được cấp phát bởi Reviewer (Checker)</p>
          </div>
        </div>
        <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">
          {currentPackage.actual_tokens_used} / {currentPackage.quota_allocated} Tokens
        </span>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
          <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
            <span>Tiến độ tiêu thụ:</span>
            <span className="font-bold font-mono">{quotaPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isQuotaWarning ? 'bg-rose-500' : 'bg-amber-500'}`}
              style={{ width: `${quotaFillPercent}%` }}
            />
          </div>
        </div>

        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Danh Sách Tác Vụ Sinh Clip:</h4>
        <div className="space-y-2">
          {currentPackage.jobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{job.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{job.ai_model}</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{job.token_cost} Tokens</span>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {job.status === 'completed' ? '✓ Đã hoàn tất' : 'Chưa hoàn thành'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
