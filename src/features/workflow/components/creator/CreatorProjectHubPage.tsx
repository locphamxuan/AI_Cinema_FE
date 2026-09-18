'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Clapperboard,
  Clock,
  ChevronRight,
  Sparkles,
  FileText,
  Video,
  MessageSquare,
  ArrowRight,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  ShieldCheck,
} from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { mockAssignedProjects } from '@/features/workflow/mocks/workflowMock';
import type { ProductionProject } from '@/types/workflow';

type StatusFilter = 'ALL' | 'IN_PROGRESS' | 'CHANGES_REQUESTED' | 'NOT_STARTED' | 'COMPLETED';

export function CreatorProjectHubPage() {
  const router = useRouter();
  const { setActiveProject } = useWorkflowStore();
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const projects = mockAssignedProjects;

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.genre.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filter === 'ALL') return matchesSearch;
    return matchesSearch && p.overall_status === filter;
  });

  const handleOpenProject = (projectId: string, _targetTab?: string) => {
    setActiveProject(projectId);
    router.push(`/creator/projects/${projectId}`);
  };

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Đang thực hiện
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            Cần chỉnh sửa
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Chờ Reviewer duyệt
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Đã hoàn thành
          </span>
        );
      case 'NOT_STARTED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/15 text-slate-600 dark:text-slate-300 border border-slate-500/30">
            <PlayCircle className="w-3.5 h-3.5 text-slate-400" />
            Cần bắt đầu
          </span>
        );
    }
  };

  const renderCTA = (proj: ProductionProject) => {
    switch (proj.overall_status) {
      case 'CHANGES_REQUESTED':
        return (
          <button
            onClick={() => handleOpenProject(proj.id, 'reviews')}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-2 transition shadow-md shadow-rose-500/20 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Xem feedback & Sửa</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
        );
      case 'NOT_STARTED':
        return (
          <button
            onClick={() => handleOpenProject(proj.id, 'brief')}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Mở kịch bản</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
        );
      case 'COMPLETED':
        return (
          <button
            onClick={() => handleOpenProject(proj.id, 'studio')}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 transition shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>Mở Studio</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
        );
      case 'IN_PROGRESS':
      default:
        return (
          <button
            onClick={() => handleOpenProject(proj.id, 'overview')}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center gap-2 transition shadow-md shadow-purple-500/25 cursor-pointer"
          >
            <span>Tiếp tục công việc</span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </button>
        );
    }
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] dark:bg-[#0B0C10] p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 transition-colors">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white border border-purple-500/30 overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 top-0 w-60 h-60 bg-ruby/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold tracking-wide uppercase">
              <Clapperboard className="w-3.5 h-3.5" /> Creator Project Hub
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Danh Sách Phim Được Assigned
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Chọn dự án phim để truy cập vào không gian làm việc (Workspace), quản lý phân cảnh kịch bản, sản xuất video AI và nhận phản hồi thẩm định.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center min-w-[90px]">
              <span className="block text-2xl font-black text-white">{projects.length}</span>
              <span className="text-[11px] text-slate-300 font-medium">Dự án</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center min-w-[90px]">
              <span className="block text-2xl font-black text-purple-300">
                {projects.filter((p) => p.overall_status === 'IN_PROGRESS').length}
              </span>
              <span className="text-[11px] text-slate-300 font-medium">Đang chạy</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center min-w-[90px]">
              <span className="block text-2xl font-black text-rose-300">
                {projects.filter((p) => p.overall_status === 'CHANGES_REQUESTED').length}
              </span>
              <span className="text-[11px] text-slate-300 font-medium">Cần sửa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filter === 'ALL'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-white dark:bg-[#161922] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
            }`}
          >
            Tất cả ({projects.length})
          </button>
          <button
            onClick={() => setFilter('IN_PROGRESS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filter === 'IN_PROGRESS'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-white dark:bg-[#161922] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
            }`}
          >
            Đang thực hiện ({projects.filter((p) => p.overall_status === 'IN_PROGRESS').length})
          </button>
          <button
            onClick={() => setFilter('CHANGES_REQUESTED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filter === 'CHANGES_REQUESTED'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                : 'bg-white dark:bg-[#161922] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
            }`}
          >
            Cần chỉnh sửa ({projects.filter((p) => p.overall_status === 'CHANGES_REQUESTED').length})
          </button>
          <button
            onClick={() => setFilter('NOT_STARTED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filter === 'NOT_STARTED'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-[#161922] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
            }`}
          >
            Cần bắt đầu ({projects.filter((p) => p.overall_status === 'NOT_STARTED').length})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filter === 'COMPLETED'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-white dark:bg-[#161922] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
            }`}
          >
            Hoàn thành ({projects.filter((p) => p.overall_status === 'COMPLETED').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm dự án..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#161922] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition font-medium"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {filteredProjects.map((proj) => {
          const progress = proj.progress_percent ?? 50;

          return (
            <div
              key={proj.id}
              className="bg-white dark:bg-[#161922] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-purple-500/40 transition-all duration-300 flex flex-col group"
            >
              {/* Card Image Banner */}
              <div className="relative h-44 sm:h-48 w-full bg-slate-900 overflow-hidden shrink-0">
                {proj.thumbnail_url ? (
                  <Image
                    src={proj.thumbnail_url}
                    alt={proj.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
                    <Clapperboard className="w-12 h-12 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#161922] via-[#161922]/20 to-transparent" />

                {/* Top Status & Role Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-white border border-white/15">
                    {proj.creator_role || 'Creator / Maker'}
                  </span>
                  {renderStatusBadge(proj.overall_status)}
                </div>

                {/* Bottom Overlay Title Info */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    {proj.genre.slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1 group-hover:text-purple-300 transition">
                    {proj.title}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {proj.synopsis}
                </p>

                {/* Active Episode Box */}
                <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3 text-purple-500" /> Tập đang cần xử lý:
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {proj.active_episode_title || `Tập 1: ${proj.episodes[0]?.title || 'Chưa khởi tạo'}`}
                  </p>
                </div>

                {/* Progress & Metadata */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Tiến độ tổng thể:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Metadata Row: Deadline & Reviewer */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Hạn: <strong className="text-slate-700 dark:text-slate-300">{proj.deadline}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate max-w-[140px]">{proj.reviewer_name?.split(' ')[0] || 'Reviewer'}</span>
                  </div>
                </div>

                {/* Primary CTA Button */}
                <div className="pt-1">{renderCTA(proj)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-[#161922] rounded-2xl border border-slate-200 dark:border-white/10 p-8 space-y-3">
          <Sparkles className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Không tìm thấy dự án phù hợp</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm để hiển thị các phim trong danh sách.
          </p>
        </div>
      )}
    </div>
  );
}

export default CreatorProjectHubPage;
