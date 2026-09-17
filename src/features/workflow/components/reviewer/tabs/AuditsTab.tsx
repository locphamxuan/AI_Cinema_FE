import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import type { ProductionProject } from '@/types/workflow';
import { StatusBadge } from '../../shared/StatusBadge';

export interface AuditsTabProps {
  project: ProductionProject;
}

export function AuditsTab({ project }: AuditsTabProps) {
  return (
    <div className="bg-white dark:bg-[#161922] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-xs">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
          <BadgeCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Trạm Kiểm Định Tuân Thủ & Phát Hành</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Kiểm tra Điều 44 Luật AI, Nghị định 142 và phát hành OTT</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {project.episodes.map((ep) => (
          <div key={ep.id} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Tập {ep.episode_number}: {ep.title}
              </span>
              <StatusBadge status={ep.status} />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Thời lượng: {ep.total_duration} · Token đã dùng: {ep.actual_tokens_used} Tokens
            </p>

            <Link
              href={`/reviewer/audit/${ep.id}`}
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              <BadgeCheck className="w-3.5 h-3.5" /> Mở Trạm Kiểm Định Chi Tiết ➔
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
