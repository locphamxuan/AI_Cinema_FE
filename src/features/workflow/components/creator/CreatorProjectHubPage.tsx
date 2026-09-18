'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Clapperboard,
  Clock,
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
  Cpu,
  Calendar,
  Zap,
  Film,
  X,
  ChevronRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { mockAssignedProjects } from '@/features/workflow/mocks/workflowMock';
import type { ProductionProject } from '@/types/workflow';

type StatusFilter = 'ALL' | 'IN_PROGRESS' | 'CHANGES_REQUESTED' | 'NOT_STARTED' | 'COMPLETED';
type ViewMode = 'slate' | 'grid';

export function CreatorProjectHubPage() {
  const router = useRouter();
  const { setActiveProject } = useWorkflowStore();
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('slate');

  const projects = mockAssignedProjects;

  // KPI Metrics
  const stats = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter((p) => p.overall_status === 'IN_PROGRESS').length;
    const changesRequested = projects.filter((p) => p.overall_status === 'CHANGES_REQUESTED').length;
    const completed = projects.filter((p) => p.overall_status === 'COMPLETED').length;
    const notStarted = projects.filter((p) => p.overall_status === 'NOT_STARTED').length;
    const totalTokens = projects.reduce((acc, p) => acc + (p.allocated_tokens || 0), 0);
    const totalEpisodes = projects.reduce((acc, p) => acc + (p.total_episodes || 0), 0);
    return { total, inProgress, changesRequested, completed, notStarted, totalTokens, totalEpisodes };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.genre.some((g) => g.toLowerCase().includes(q)) ||
        (p.creator_role && p.creator_role.toLowerCase().includes(q)) ||
        (p.active_episode_title && p.active_episode_title.toLowerCase().includes(q));

      if (filter === 'ALL') return matchesSearch;
      return matchesSearch && p.overall_status === filter;
    });
  }, [projects, filter, searchQuery]);

  const handleOpenProject = (projectId: string, _targetTab?: string) => {
    setActiveProject(projectId);
    router.push(`/creator/projects/${projectId}`);
  };

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 backdrop-blur-md shadow-xs shadow-purple-500/10">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Đang thực hiện
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30 backdrop-blur-md shadow-xs shadow-rose-500/10">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            Cần chỉnh sửa
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-xs shadow-amber-500/10">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Chờ Reviewer duyệt
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-xs shadow-emerald-500/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Đã hoàn thành
          </span>
        );
      case 'NOT_STARTED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30 backdrop-blur-md">
            <PlayCircle className="w-3.5 h-3.5 text-blue-500" />
            Cần bắt đầu
          </span>
        );
    }
  };

  const getStatusBorderColor = (status?: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'from-purple-500 to-indigo-500';
      case 'CHANGES_REQUESTED':
        return 'from-rose-500 to-amber-500';
      case 'COMPLETED':
        return 'from-emerald-500 to-teal-500';
      case 'NOT_STARTED':
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  const renderCTA = (proj: ProductionProject, compact = false) => {
    const sizeClass = compact ? 'py-2.5 px-3.5 text-xs' : 'py-3 px-5 text-xs';

    switch (proj.overall_status) {
      case 'CHANGES_REQUESTED':
        return (
          <button
            onClick={() => handleOpenProject(proj.id, 'reviews')}
            className={`${sizeClass} rounded-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-rose-500/25 cursor-pointer group/btn whitespace-nowrap`}
          >
            <MessageSquare className="w-4 h-4 text-rose-100 shrink-0" />
            <span>Xem feedback & Sửa Cảnh</span>
            <ChevronRight className="w-4 h-4 ml-auto transition-transform group-hover/btn:translate-x-1 shrink-0" />
          </button>
        );
      case 'NOT_STARTED':
        return (
          <button
            onClick={() => handleOpenProject(proj.id, 'brief')}
            className={`${sizeClass} rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-blue-500/25 cursor-pointer group/btn whitespace-nowrap`}
          >
            <FileText className="w-4 h-4 text-blue-100 shrink-0" />
            <span>Mở Kịch Bản & Prompt</span>
            <ChevronRight className="w-4 h-4 ml-auto transition-transform group-hover/btn:translate-x-1 shrink-0" />
          </button>
        );
      case 'COMPLETED':
        return (
          <button
            onClick={() => handleOpenProject(proj.id, 'studio')}
            className={`${sizeClass} rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-emerald-500/25 cursor-pointer group/btn whitespace-nowrap`}
          >
            <Video className="w-4 h-4 text-emerald-100 shrink-0" />
            <span>Xem Phim Hoàn Thiện</span>
            <ChevronRight className="w-4 h-4 ml-auto transition-transform group-hover/btn:translate-x-1 shrink-0" />
          </button>
        );
      case 'IN_PROGRESS':
      default:
        return (
          <button
            onClick={() => handleOpenProject(proj.id, 'overview')}
            className={`${sizeClass} rounded-xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-purple-500/30 cursor-pointer group/btn whitespace-nowrap`}
          >
            <span>Tiếp Tục Sản Xuất Trong Studio</span>
            <ArrowRight className="w-4 h-4 ml-auto transition-transform group-hover/btn:translate-x-1 shrink-0" />
          </button>
        );
    }
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] dark:bg-[#0B0C10] p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 transition-colors">
      {/* Luxury Cinematic Header Banner (Unified, No Box Clutter) */}
      <div className="relative rounded-3xl bg-gradient-to-br from-purple-950 via-[#101424] to-[#0A0C14] p-6 sm:p-8 text-white border border-purple-500/30 overflow-hidden shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 top-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-[11px] font-bold tracking-wider uppercase backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Clapperboard className="w-3.5 h-3.5 text-purple-300" />
              AI CREATOR WORKSPACE • 2026
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-200">
              Danh Sách Phim Được Assigned
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Không gian làm việc điện ảnh AI cho Đạo diễn &amp; Maker. Quản lý kịch bản phân cảnh, điều phối render video 4K và phối hợp thẩm định với Reviewer.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-300/80">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Đồng bộ kịch bản tự động
              </span>
              <span className="text-white/20">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Quản lý hạn mức Token realtime
              </span>
              <span className="text-white/20">•</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Tuân thủ Nghị định 142/2024
              </span>
            </div>
          </div>

          {/* Integrated Studio Metric Strip (Clean Single-Bar, No Clunky Boxes) */}
          <div className="flex items-center divide-x divide-white/10 bg-white/[0.06] backdrop-blur-xl border border-white/15 rounded-2xl p-2 sm:p-2.5 shadow-xl shrink-0 overflow-x-auto">
            {/* Metric 1: Total Projects */}
            <div className="px-4 py-2 text-center min-w-[95px]">
              <div className="flex items-center justify-center gap-1.5 text-blue-300 text-xs font-semibold mb-0.5">
                <Film className="w-3.5 h-3.5" />
                <span>Dự án</span>
              </div>
              <span className="block text-2xl font-black text-white">{stats.total}</span>
              <span className="text-[10px] text-slate-400">{stats.totalEpisodes} tập phim</span>
            </div>

            {/* Metric 2: In Progress */}
            <div className="px-4 py-2 text-center min-w-[95px]">
              <div className="flex items-center justify-center gap-1.5 text-purple-300 text-xs font-semibold mb-0.5">
                <Video className="w-3.5 h-3.5" />
                <span>Đang quay</span>
              </div>
              <span className="block text-2xl font-black text-purple-300">{stats.inProgress}</span>
              <span className="text-[10px] text-purple-200/80">815 Tokens</span>
            </div>

            {/* Metric 3: Changes Requested */}
            <div className="px-4 py-2 text-center min-w-[95px]">
              <div className="flex items-center justify-center gap-1.5 text-rose-300 text-xs font-semibold mb-0.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Cần sửa</span>
              </div>
              <span className="block text-2xl font-black text-rose-300">{stats.changesRequested}</span>
              <span className="text-[10px] text-rose-200/80">Ưu tiên xử lý</span>
            </div>

            {/* Metric 4: Completed */}
            <div className="px-4 py-2 text-center min-w-[95px]">
              <div className="flex items-center justify-center gap-1.5 text-emerald-300 text-xs font-semibold mb-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã phát</span>
              </div>
              <span className="block text-2xl font-black text-emerald-300">{stats.completed}</span>
              <span className="text-[10px] text-emerald-200/80">Công chiếu OTT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Toolbar: Filters, View Switcher & Search */}
      <div className="bg-white/80 dark:bg-[#111420]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-2.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filter === 'ALL'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tất cả</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${filter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'}`}>
              {stats.total}
            </span>
          </button>

          <button
            onClick={() => setFilter('IN_PROGRESS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filter === 'IN_PROGRESS'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Đang thực hiện</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${filter === 'IN_PROGRESS' ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300'}`}>
              {stats.inProgress}
            </span>
          </button>

          <button
            onClick={() => setFilter('CHANGES_REQUESTED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filter === 'CHANGES_REQUESTED'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Cần chỉnh sửa</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${filter === 'CHANGES_REQUESTED' ? 'bg-white/20 text-white' : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'}`}>
              {stats.changesRequested}
            </span>
          </button>

          <button
            onClick={() => setFilter('NOT_STARTED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filter === 'NOT_STARTED'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Cần bắt đầu</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${filter === 'NOT_STARTED' ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'}`}>
              {stats.notStarted}
            </span>
          </button>

          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filter === 'COMPLETED'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Hoàn thành</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${filter === 'COMPLETED' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'}`}>
              {stats.completed}
            </span>
          </button>
        </div>

        {/* Right Tools: View Switcher & Search Bar */}
        <div className="flex items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-[#161922] border border-slate-200 dark:border-white/10 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('slate')}
              title="Chế độ thẻ ngang điện ảnh (Slate View)"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'slate'
                  ? 'bg-white dark:bg-purple-600 text-purple-600 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden lg:inline text-[11px]">Thẻ Ngang</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Chế độ lưới (Grid View)"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-purple-600 text-purple-600 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden lg:inline text-[11px]">Lưới</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm phim, thể loại..."
              className="w-full pl-9 pr-7 py-2 bg-slate-100 dark:bg-[#161922] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Projects Presentation: Slate View vs Grid View */}
      {viewMode === 'slate' ? (
        /* HORIZONTAL CINEMA SLATE VIEW (Clean, Spacious, No nested boxes) */
        <div className="space-y-4">
          {filteredProjects.map((proj) => {
            const progress = proj.progress_percent ?? 50;
            const statusBorder = getStatusBorderColor(proj.overall_status);

            return (
              <div
                key={proj.id}
                className="bg-white dark:bg-[#121524] border border-slate-200/90 dark:border-white/[0.08] hover:border-purple-500/50 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group"
              >
                {/* Left Side: Cinematic Poster Banner */}
                <div className="relative w-full md:w-80 lg:w-96 shrink-0 h-52 md:h-auto min-h-[220px] bg-slate-950 overflow-hidden">
                  {proj.thumbnail_url ? (
                    <Image
                      src={proj.thumbnail_url}
                      alt={proj.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 384px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
                      <Clapperboard className="w-12 h-12 text-white/30" />
                    </div>
                  )}

                  {/* Dark Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

                  {/* Poster Header Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
                      <Film className="w-3 h-3 text-purple-300" />
                      {proj.creator_role || 'Creator / Maker'}
                    </span>
                    <div className="md:hidden">{renderStatusBadge(proj.overall_status)}</div>
                  </div>

                  {/* Poster Bottom Info */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {proj.genre.slice(0, 2).map((g) => (
                        <span
                          key={g}
                          className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-slate-200 border border-white/20"
                        >
                          {g}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-purple-500/40 text-purple-200 border border-purple-400/30 backdrop-blur-md">
                        AI 4K HDR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Clean Production Details & Timeline (Free of heavy boxes) */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  {/* Title & Status Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>{proj.total_episodes} Tập phim</span>
                        <span className="text-slate-300 dark:text-white/20">•</span>
                        <span>Mốc tiến độ: {proj.milestones?.length || 4} giai đoạn</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                        {proj.title}
                      </h2>
                    </div>

                    <div className="hidden md:block shrink-0">
                      {renderStatusBadge(proj.overall_status)}
                    </div>
                  </div>

                  {/* Synopsis */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    {proj.synopsis}
                  </p>

                  {/* Production Timeline Strip (Accent Line instead of a heavy box) */}
                  <div
                    className={`pl-3.5 border-l-2 py-1 transition-all ${
                      proj.overall_status === 'CHANGES_REQUESTED'
                        ? 'border-rose-500 text-rose-700 dark:text-rose-300'
                        : proj.overall_status === 'IN_PROGRESS'
                        ? 'border-purple-500 text-purple-700 dark:text-purple-300'
                        : proj.overall_status === 'COMPLETED'
                        ? 'border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'border-blue-500 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Tập đang xử lý:</span>
                      <span className="text-slate-900 dark:text-white normal-case font-bold">
                        {proj.active_episode_title || `Tập 1: ${proj.episodes[0]?.title || 'Chưa khởi tạo'}`}
                      </span>
                    </div>

                    <p className="text-xs mt-0.5 flex items-center gap-1 font-medium">
                      {proj.overall_status === 'CHANGES_REQUESTED' ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>Reviewer yêu cầu chỉnh sửa prompt &amp; visual Cảnh #2, #3</span>
                        </>
                      ) : proj.overall_status === 'IN_PROGRESS' ? (
                        <>
                          <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>Đang render clip 4K và phối hợp thẩm định cùng Reviewer</span>
                        </>
                      ) : proj.overall_status === 'COMPLETED' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Toàn bộ phân cảnh đã đạt chuẩn Nghị định 142 và công chiếu OTT</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>Chờ đạo diễn khởi tạo kịch bản phân cảnh đầu tiên</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Progress & Bottom Action Row (Side by side) */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Progress + Token & Reviewer Meta */}
                    <div className="space-y-2 flex-1 max-w-xl">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Tiến độ sản xuất</span>
                        <span className="font-extrabold text-slate-900 dark:text-white font-mono">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-700"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5 text-amber-500" />
                          <span>Hạn mức:</span>
                          <strong className="text-slate-700 dark:text-slate-200 font-mono">
                            {proj.consumed_tokens ?? 0}/{proj.allocated_tokens ?? 0} Tokens
                          </strong>
                        </span>

                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span>Hạn chót:</span>
                          <strong className="text-slate-700 dark:text-slate-200">{proj.deadline}</strong>
                        </span>

                        <span className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 text-[9px] font-bold flex items-center justify-center">
                            {(proj.reviewer_name || 'LB').slice(0, 1)}
                          </div>
                          <span>{proj.reviewer_name || 'Lê Quốc Bảo (Checker)'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action CTA Button */}
                    <div className="shrink-0 pt-1 lg:pt-0">
                      {renderCTA(proj, false)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* GRID VIEW (Compact 2-Column Cinema Grid with clean visual hierarchy) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {filteredProjects.map((proj) => {
            const progress = proj.progress_percent ?? 50;
            const statusBorder = getStatusBorderColor(proj.overall_status);

            return (
              <div
                key={proj.id}
                className="bg-white dark:bg-[#121524] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-purple-500/50 transition-all duration-300 flex flex-col group relative"
              >
                {/* Top Status Accent Line */}
                <div className={`h-1 w-full bg-gradient-to-r ${statusBorder}`} />

                {/* Card Image Banner */}
                <div className="relative h-48 sm:h-52 w-full bg-slate-900 overflow-hidden shrink-0">
                  {proj.thumbnail_url ? (
                    <Image
                      src={proj.thumbnail_url}
                      alt={proj.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
                      <Clapperboard className="w-12 h-12 text-white/30" />
                    </div>
                  )}

                  {/* Cinematic Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121524] via-[#121524]/50 to-transparent" />

                  {/* Top Row Badges: Role & Status */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-white border border-white/20 shadow-md">
                      <Film className="w-3 h-3 text-purple-300" />
                      {proj.creator_role || 'Creator / Maker'}
                    </span>
                    {renderStatusBadge(proj.overall_status)}
                  </div>

                  {/* Bottom Overlay Title & Tags */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      {proj.genre.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-slate-200 border border-white/20"
                        >
                          {g}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30 backdrop-blur-md">
                        AI 4K HDR
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight line-clamp-1 group-hover:text-purple-300 transition-colors drop-shadow-md">
                      {proj.title}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300/90 line-clamp-2 leading-relaxed">
                    {proj.synopsis}
                  </p>

                  {/* Streamlined Timeline Strip */}
                  <div
                    className={`pl-3 border-l-2 py-1 ${
                      proj.overall_status === 'CHANGES_REQUESTED'
                        ? 'border-rose-500 text-rose-600 dark:text-rose-300'
                        : proj.overall_status === 'IN_PROGRESS'
                        ? 'border-purple-500 text-purple-600 dark:text-purple-300'
                        : proj.overall_status === 'COMPLETED'
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-300'
                        : 'border-blue-500 text-blue-600 dark:text-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        TẬP ĐANG XỬ LÝ
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400">
                        {proj.total_episodes} TẬP
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                      {proj.active_episode_title || `Tập 1: ${proj.episodes[0]?.title || 'Chưa khởi tạo'}`}
                    </p>
                  </div>

                  {/* Progress & Quota Row */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Tiến độ sản xuất</span>
                      <span className="font-extrabold text-slate-900 dark:text-white font-mono text-xs">
                        {progress}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-amber-500" />
                        <span>Hạn mức Token:</span>
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">
                        {proj.consumed_tokens ?? 0} / {proj.allocated_tokens ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Row: Deadline & Reviewer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>
                        Hạn chót: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{proj.deadline}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 max-w-[180px]">
                      <div className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-bold flex items-center justify-center shrink-0">
                        {(proj.reviewer_name || 'Checker').slice(0, 1)}
                      </div>
                      <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                        {proj.reviewer_name || 'Lê Quốc Bảo (Checker)'}
                      </span>
                    </div>
                  </div>

                  {/* Primary CTA Button */}
                  <div className="pt-1">{renderCTA(proj, true)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-[#121524] rounded-3xl border border-slate-200 dark:border-white/10 p-8 space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Không tìm thấy dự án phù hợp</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Không có dự án nào khớp với bộ lọc hoặc từ khóa &quot;{searchQuery}&quot;. Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.
          </p>
          <button
            onClick={() => {
              setFilter('ALL');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-purple-500/20 cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}

export default CreatorProjectHubPage;


