import Link from 'next/link';
import { Calendar, Tv, Play, Eye } from 'lucide-react';
import type { ProductionProject } from '@/types/workflow';
import { episodeName, spansSeasons } from '@/features/workflow/lib/episodeLabel';

export interface PublicationTabProps {
  project: ProductionProject;
}

export function PublicationTab({ project }: PublicationTabProps) {
  const multiSeason = spansSeasons(project.episodes);
  const publishedEpisodes = project.episodes.filter((e) => e.status === 'PUBLISHED');

  return (
    <div className="space-y-5 text-xs">
      {/* Sleek Hero Header */}
      <div className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  OTT Broadcasting Pipeline
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/10">
                  Nghị định 142 & Điều 44
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Lịch Chiếu & Kế Hoạch Xuất Bản OTT
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Quản lý lịch phát hành chính thức, phân phối đa nền tảng và kiểm định nhãn AI công khai
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono font-semibold text-xs">
              {publishedEpisodes.length}/{project.episodes.length} Tập Đã Phát Sóng
            </span>
          </div>
        </div>
      </div>

      {/* Publication Roadmap Card */}
      <div className="bg-white dark:bg-[#151822] rounded-xl border border-slate-200/80 dark:border-white/10 p-5 space-y-4 shadow-xs transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>Lịch phát hành các tập</span>
          </h3>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Hạn chót toàn dự án:{' '}
            <strong className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
              {project.deadline}
            </strong>
          </span>
        </div>

        <div className="space-y-3">
          {project.episodes.map((ep) => {
            const isPublished = ep.status === 'PUBLISHED';
            const isCompliancePassed = ep.status === 'COMPLIANCE_PASSED';
            const cleanTitle = episodeName(ep.title);

            return (
              <div
                key={ep.id}
                className="bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04] border border-slate-200/70 dark:border-white/5 rounded-xl p-4 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {multiSeason ? `${ep.season_number}.${ep.episode_number}` : `#${ep.episode_number}`}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {cleanTitle}
                      </h4>
                      {isPublished ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          Đang Công Chiếu
                        </span>
                      ) : isCompliancePassed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                          Sẵn Sàng Chiếu
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          Đang Sản Xuất
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Thời lượng: {ep.total_duration} · Tiêu thụ: {ep.actual_tokens_used.toLocaleString()} Tokens · Phụ trách: {project.creator_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Kế hoạch công chiếu:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {project.planned_release_date || 'Chưa đặt'}
                    </span>
                  </div>

                  {isPublished ? (
                    <Link
                      href={`/watch/${ep.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-medium text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Xem trên OTT</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/reviewer/audit/${ep.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 font-medium text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Kiểm Tra Bản Dựng</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
