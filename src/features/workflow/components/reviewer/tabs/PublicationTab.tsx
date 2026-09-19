import Link from 'next/link';
import { Calendar, Tv, ShieldCheck, CheckCircle2, Clock, Play, Radio, Eye } from 'lucide-react';
import type { ProductionProject } from '@/types/workflow';

export interface PublicationTabProps {
  project: ProductionProject;
}

export function PublicationTab({ project }: PublicationTabProps) {
  const publishedEpisodes = project.episodes.filter((e) => e.status === 'PUBLISHED');

  return (
    <div className="space-y-6 text-xs">
      {/* Hero Header */}
      <div className="bg-white dark:bg-[#181B26] rounded-2xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-purple-600" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  OTT Broadcasting & Publication Pipeline
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  NĐ 142 & Điều 44
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                Lịch Chiếu & Kế Hoạch Xuất Bản OTT: {project.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Quản lý lịch phát hành chính thức, phân phối đa nền tảng và kiểm định nhãn AI công khai
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              {publishedEpisodes.length}/{project.episodes.length} Tập Đã Phát Sóng
            </span>
          </div>
        </div>
      </div>

      {/* Publication Roadmap List */}
      <div className="bg-white dark:bg-[#181B26] rounded-2xl border border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" /> Danh Sách Lịch Phát Sóng Công Khai Các Tập
          </h3>
          <span className="text-[11px] text-slate-400">
            Hạn chót toàn dự án: <strong className="text-slate-700 dark:text-slate-200">{project.deadline}</strong>
          </span>
        </div>

        <div className="space-y-3">
          {project.episodes.map((ep, idx) => {
            const isPublished = ep.status === 'PUBLISHED';
            const isCompliancePassed = ep.status === 'COMPLIANCE_PASSED';

            return (
              <div
                key={ep.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isPublished
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/40'
                    : isCompliancePassed
                    ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800/40'
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isPublished
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-[#12141A] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    #{ep.episode_number}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {ep.title.replace(/^Tập \d+:\s*/, '')}
                      </h4>
                      {isPublished ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Radio className="w-3 h-3 animate-pulse" /> Đang Công Chiếu
                        </span>
                      ) : isCompliancePassed ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                          Đã duyệt pháp lý
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                          Đang Sản Xuất
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Thời lượng: {ep.total_duration} · Tiêu thụ: {ep.actual_tokens_used} Tokens · Phụ trách: {project.creator_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 block">Kế hoạch công chiếu:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {project.planned_release_date || '2026-12-15'}
                    </span>
                  </div>

                  {isPublished ? (
                    <Link
                      href={`/watch/${ep.id}`}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" /> Xem trên OTT
                    </Link>
                  ) : (
                    <Link
                      href={`/reviewer/audit/${ep.id}`}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Kiểm Tra Bản Dựng
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
