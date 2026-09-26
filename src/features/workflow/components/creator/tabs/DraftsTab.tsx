import { FilePen } from 'lucide-react';
import type { EpisodePackage } from '@/types/workflow';
import { StatusBadge } from '../../shared/StatusBadge';
import { isDraft } from '@/features/workflow/lib/workflowState';

export interface DraftsTabProps {
  episodes: EpisodePackage[];
  onOpen: (packageId: string) => void;
}

const timeFormat = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

/** Every episode plan of the film still being written, to pick up where the Creator left off. */
export function DraftsTab({ episodes, onOpen }: DraftsTabProps) {
  const drafts = episodes.filter(isDraft);

  return (
    <div className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 space-y-4 shadow-xs">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FilePen className="w-5 h-5 text-purple-600 dark:text-purple-400" aria-hidden="true" /> Bản nháp
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Kế hoạch các tập chưa gửi hoặc bị trả về để sửa. Bản nháp đã lưu nằm trên máy chủ, mở máy khác vẫn thấy.
        </p>
      </div>

      {drafts.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/15 rounded-xl p-6 text-center">
          Không có bản nháp nào. Kế hoạch của mọi tập đã được gửi.
        </p>
      ) : (
        <ul className="space-y-2">
          {drafts.map((episode) => {
            const { brief } = episode;
            return (
              <li key={episode.id}>
                <button
                  type="button"
                  onClick={() => onOpen(episode.id)}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] hover:border-purple-400 dark:hover:border-purple-500/50 transition cursor-pointer space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{episode.title}</span>
                    <StatusBadge status={episode.status} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{brief.script_text || 'Chưa viết kịch bản.'}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {brief.scene_breakdown.length} cảnh · {brief.target_duration_minutes} phút · {brief.estimated_tokens.toLocaleString('vi-VN')} token ·{' '}
                    {brief.has_unsaved_changes ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Có thay đổi chưa lưu</span>
                    ) : (
                      (() => {
                        if (!brief.updated_at) return null;
                        const d = new Date(brief.updated_at);
                        return isNaN(d.getTime()) ? null : `Sửa lần cuối ${timeFormat.format(d)}`;
                      })()
                    )}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
