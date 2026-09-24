import type { ProductionProject } from '@/types/workflow';
import { availableBudget } from '@/features/workflow/lib/planVerdict';
import { pendingQuotaRequest } from '@/features/workflow/lib/quota';
import { QuotaRequestCard } from './QuotaRequestCard';

export interface ReviewerTokensTabProps {
  project: ProductionProject;
}

export function TokensTab({ project }: ReviewerTokensTabProps) {
  const percent = project.total_budget_tokens > 0 ? (project.allocated_tokens / project.total_budget_tokens) * 100 : 0;
  const requests = project.episodes.flatMap((episode) => {
    const request = pendingQuotaRequest(episode);
    return request ? [{ episode, request }] : [];
  });

  return (
    <div className="bg-white dark:bg-[#161922] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Ngân sách token của dự án</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Kiểm soát dòng tiêu thụ tài nguyên AI trong quá trình sản xuất</p>
        </div>
        <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">
          {project.allocated_tokens} / {project.total_budget_tokens} Tokens
        </span>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
        <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
          <span>Hạn mức đã cấp phát:</span>
          <span className="font-bold font-mono">{percent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <section aria-labelledby="quota-requests-heading" className="space-y-3">
        <h3 id="quota-requests-heading" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Yêu cầu xin thêm token
        </h3>
        {requests.length > 0 ? (
          <ul className="space-y-3">
            {requests.map(({ episode, request }) => (
              <QuotaRequestCard key={request.id} episode={episode} request={request} availableBudget={availableBudget(project)} />
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">Không có yêu cầu nào đang chờ.</p>
        )}
      </section>
    </div>
  );
}
