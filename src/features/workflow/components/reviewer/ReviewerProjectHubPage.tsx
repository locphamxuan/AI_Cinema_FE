'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ShieldCheck,
  Clock,
  Video,
  ArrowRight,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Calendar,
  Zap,
  Film,
  X,
  ChevronRight,
  LayoutGrid,
  List,
  Plus,
  User,
} from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { mockAssignedProjects } from '@/features/workflow/mocks/workflowMock';
import type { ProductionProject } from '@/types/workflow';
import { CreateProjectModal, type CreateProjectFormState } from './modals/CreateProjectModal';

type StatusFilter = 'ALL' | 'PLAN_PENDING' | 'IN_PROGRESS' | 'CHANGES_REQUESTED' | 'COMPLETED';
type ViewMode = 'slate' | 'grid';

const DEFAULT_FORM: CreateProjectFormState = {
  title: '',
  genre: ['Khoa học viễn tưởng', 'Hành động AI'],
  synopsis: '',
  episodes: 5,
  budgetTokens: 3000,
  deadline: '2026-12-31',
  releaseDate: '2027-01-15',
  milestones: [
    {
      id: 'ms-init-1',
      title: 'Cột mốc 1: Khởi tạo kịch bản & phân cảnh',
      startDate: '2026-09-17',
      deadline: '2026-10-15',
      description: 'Hoàn thành bản kịch bản chi tiết và hệ thống prompt.',
      status: 'in_progress',
    },
    {
      id: 'ms-init-2',
      title: 'Cột mốc 2: Sản xuất AI Video & Nộp duyệt',
      startDate: '2026-10-16',
      deadline: '2026-11-15',
      description: 'Render clip 4K và gửi Thẩm định viên kiểm định.',
      status: 'pending',
    },
  ],
};

export function ReviewerProjectHubPage() {
  const router = useRouter();
  const { setActiveProject, createProject } = useWorkflowStore();

  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('slate');

  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateProjectFormState>(DEFAULT_FORM);

  const projects = mockAssignedProjects;

  // KPI Metrics
  const stats = useMemo(() => {
    const total = projects.length;
    const pendingPlan = projects.filter(
      (p) => p.overall_status === 'NOT_STARTED' || p.episodes.some((e) => e.status === 'PLAN_PENDING')
    ).length;
    const inProgress = projects.filter((p) => p.overall_status === 'IN_PROGRESS').length;
    const changesRequested = projects.filter((p) => p.overall_status === 'CHANGES_REQUESTED').length;
    const completed = projects.filter((p) => p.overall_status === 'COMPLETED').length;
    const totalTokensAllocated = projects.reduce((acc, p) => acc + (p.allocated_tokens || 0), 0);

    return { total, pendingPlan, inProgress, changesRequested, completed, totalTokensAllocated };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.genre.some((g) => g.toLowerCase().includes(q)) ||
        (p.creator_name && p.creator_name.toLowerCase().includes(q)) ||
        (p.reviewer_name && p.reviewer_name.toLowerCase().includes(q));

      if (filter === 'ALL') return matchesSearch;
      if (filter === 'PLAN_PENDING')
        return (
          matchesSearch &&
          (p.overall_status === 'NOT_STARTED' || p.episodes.some((e) => e.status === 'PLAN_PENDING'))
        );
      return matchesSearch && p.overall_status === filter;
    });
  }, [projects, filter, searchQuery]);

  const handleOpenProjectWorkspace = (projectId: string) => {
    setActiveProject(projectId);
    router.push(`/reviewer/projects/${projectId}`);
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim()) return;

    createProject({
      title: createForm.title,
      genre: createForm.genre.length > 0 ? createForm.genre : ['Khoa học viễn tưởng'],
      synopsis: createForm.synopsis || 'Dự án điện ảnh ứng dụng công nghệ GenAI thế hệ mới.',
      total_episodes: createForm.episodes,
      total_budget_tokens: createForm.budgetTokens,
      deadline: createForm.deadline,
      planned_release_date: createForm.releaseDate,
      milestones: createForm.milestones,
    });

    setIsCreateProjectOpen(false);
    setCreateForm(DEFAULT_FORM);
    alert('Đã khởi tạo dự án sản xuất phim AI mới thành công!');
  };

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 backdrop-blur-md shadow-xs shadow-purple-500/10">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Đang sản xuất
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30 backdrop-blur-md shadow-xs shadow-rose-500/10">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            Đã yêu cầu sửa
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-xs shadow-emerald-500/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Đã công chiếu OTT
          </span>
        );
      case 'NOT_STARTED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-xs shadow-amber-500/10">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Chờ duyệt kịch bản & Quota
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
        return 'from-amber-500 to-orange-500';
    }
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] dark:bg-[#0B0C10] p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 transition-colors">
      {/* Reviewer Header Banner (Unified & Synchronous with Creator) */}
      <div className="relative rounded-3xl bg-gradient-to-br from-indigo-950 via-[#121528] to-[#0B0D18] p-6 sm:p-8 text-white border border-purple-500/30 overflow-hidden shadow-2xl">
        {/* Ambient Glow Effects */}
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 top-0 w-64 h-64 bg-amber-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-[11px] font-bold tracking-wider uppercase backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
              AI REVIEWER WORKSPACE • 2026
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-200">
              Danh Sách Dự Án Phim Thẩm Định
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Trung tâm kiểm định kịch bản phân cảnh, điều phối cấp phát AI Token Quota và kiểm duyệt tuân thủ pháp lý Nghị định 142 cho các Đạo diễn (Maker).
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-300/80">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Thẩm định kịch bản tự động
              </span>
              <span className="text-white/20">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Cấp phát Token Quota realtime
              </span>
              <span className="text-white/20">•</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Tuân thủ Nghị định 142/2024
              </span>
            </div>
          </div>

          <div className="flex items-center shrink-0">
            {/* Reviewer Metric Strip */}
            <div className="flex items-center divide-x divide-white/10 bg-white/[0.06] backdrop-blur-xl border border-white/15 rounded-2xl p-2 sm:p-2.5 shadow-xl">
              <div className="px-3.5 py-1.5 text-center min-w-[80px]">
                <div className="flex items-center justify-center gap-1 text-blue-300 text-[11px] font-semibold mb-0.5">
                  <Film className="w-3 h-3" />
                  <span>Tổng dự án</span>
                </div>
                <span className="block text-xl font-black text-white">{stats.total}</span>
              </div>

              <div className="px-3.5 py-1.5 text-center min-w-[80px]">
                <div className="flex items-center justify-center gap-1 text-amber-300 text-[11px] font-semibold mb-0.5">
                  <Clock className="w-3 h-3" />
                  <span>Chờ duyệt</span>
                </div>
                <span className="block text-xl font-black text-amber-300">{stats.pendingPlan}</span>
              </div>

              <div className="px-3.5 py-1.5 text-center min-w-[80px]">
                <div className="flex items-center justify-center gap-1 text-purple-300 text-[11px] font-semibold mb-0.5">
                  <Video className="w-3 h-3" />
                  <span>Đang quay</span>
                </div>
                <span className="block text-xl font-black text-purple-300">{stats.inProgress}</span>
              </div>

              <div className="px-3.5 py-1.5 text-center min-w-[80px]">
                <div className="flex items-center justify-center gap-1 text-emerald-300 text-[11px] font-semibold mb-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Đã công chiếu</span>
                </div>
                <span className="block text-xl font-black text-emerald-300">{stats.completed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Toolbar: Filters, View Switcher, Search & Create Project */}
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
            onClick={() => setFilter('PLAN_PENDING')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filter === 'PLAN_PENDING'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Chờ duyệt kịch bản</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${filter === 'PLAN_PENDING' ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'}`}>
              {stats.pendingPlan}
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
            <span>Đang sản xuất</span>
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
            <span>Đã sửa</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${filter === 'CHANGES_REQUESTED' ? 'bg-white/20 text-white' : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'}`}>
              {stats.changesRequested}
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
            <span>Đã hoàn thành</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${filter === 'COMPLETED' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'}`}>
              {stats.completed}
            </span>
          </button>
        </div>

        {/* Right Tools: View Switcher & Search Bar */}
        <div className="flex items-center gap-2.5">
          {/* View Switcher */}
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
              placeholder="Tìm phim, thể loại, đạo diễn..."
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

      {/* Action Row: Create Project Button positioned outside banner and below search bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
          <span>Danh sách dự án phim thẩm định</span>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          <span className="text-purple-600 dark:text-purple-400 font-bold font-mono">{filteredProjects.length} dự án</span>
        </div>

        <button
          onClick={() => setIsCreateProjectOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-purple-500/25 cursor-pointer border border-purple-400/30"
        >
          <Plus className="w-4 h-4 text-purple-200" />
          <span>Tạo Dự Án Phim Mới</span>
        </button>
      </div>

      {/* Projects List Presentation */}
      {viewMode === 'slate' ? (
        <div className="space-y-4">
          {filteredProjects.map((proj) => {
            const progress = proj.progress_percent ?? 50;

            return (
              <div
                key={proj.id}
                className="bg-white dark:bg-[#121524] border border-slate-200/90 dark:border-white/[0.08] hover:border-purple-500/50 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group"
              >
                {/* Left Poster Image */}
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
                      <Film className="w-12 h-12 text-white/30" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-purple-200 border border-purple-400/30">
                      <ShieldCheck className="w-3 h-3 text-purple-300" />
                      Reviewer / Checker
                    </span>
                    <div className="md:hidden">{renderStatusBadge(proj.overall_status)}</div>
                  </div>

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

                {/* Right Content & Metrics */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
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

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    {proj.synopsis}
                  </p>

                  <div className="pl-3.5 border-l-2 py-1 border-purple-500 text-purple-700 dark:text-purple-300">
                    <div className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase">
                      <Layers className="w-3.5 h-3.5" />
                      <span>ĐẠO DIỄN / MAKER:</span>
                      <strong className="text-slate-900 dark:text-white normal-case">{proj.creator_name}</strong>
                    </div>

                    <p className="text-xs mt-0.5 flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                      <span>Tập đang xử lý: <strong>{proj.active_episode_title || `Tập 1: ${proj.episodes[0]?.title || 'Chưa duyệt'}`}</strong></span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1 max-w-xl">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Tiến độ thẩm định &amp; sản xuất</span>
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
                          <span>Hạn mức Token:</span>
                          <strong className="text-slate-700 dark:text-slate-200 font-mono">
                            {proj.consumed_tokens ?? 0}/{proj.allocated_tokens ?? 0}
                          </strong>
                        </span>

                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span>Hạn chót:</span>
                          <strong className="text-slate-700 dark:text-slate-200">{proj.deadline}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 pt-1 lg:pt-0">
                      <button
                        onClick={() => handleOpenProjectWorkspace(proj.id)}
                        className="py-3 px-5 text-xs rounded-xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-purple-500/30 cursor-pointer group/btn whitespace-nowrap"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-200 shrink-0" />
                        <span>Thẩm Định Dự Án Trong Workspace</span>
                        <ArrowRight className="w-4 h-4 ml-auto transition-transform group-hover/btn:translate-x-1 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((proj) => {
            const progress = proj.progress_percent ?? 50;
            const statusBorder = getStatusBorderColor(proj.overall_status);

            return (
              <div
                key={proj.id}
                className="bg-white dark:bg-[#121524] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-purple-500/50 transition-all duration-300 flex flex-col group relative"
              >
                <div className={`h-1 w-full bg-gradient-to-r ${statusBorder}`} />

                <div className="relative h-48 sm:h-52 w-full bg-slate-900 overflow-hidden shrink-0">
                  {proj.thumbnail_url ? (
                    <Image
                      src={proj.thumbnail_url}
                      alt={proj.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
                      <Film className="w-12 h-12 text-white/30" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#121524] via-[#121524]/50 to-transparent" />

                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-white border border-white/20 shadow-md">
                      <ShieldCheck className="w-3 h-3 text-purple-300" />
                      Reviewer / Checker
                    </span>
                    {renderStatusBadge(proj.overall_status)}
                  </div>

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
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight line-clamp-1 group-hover:text-purple-300 transition-colors drop-shadow-md">
                      {proj.title}
                    </h3>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300/90 line-clamp-2 leading-relaxed">
                    {proj.synopsis}
                  </p>

                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-purple-500" /> Đạo diễn (Maker):
                    </span>
                    <strong className="text-slate-900 dark:text-white">{proj.creator_name}</strong>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Tiến độ</span>
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
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" /> Hạn chót: <strong>{proj.deadline}</strong>
                    </span>
                    <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                      {proj.allocated_tokens}/{proj.total_budget_tokens} T
                    </span>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => handleOpenProjectWorkspace(proj.id)}
                      className="w-full py-2.5 px-4 text-xs rounded-xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-purple-500/25 cursor-pointer group/btn"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-200 shrink-0" />
                      <span>Thẩm Định Dự Án</span>
                      <ChevronRight className="w-4 h-4 ml-auto transition-transform group-hover/btn:translate-x-1 shrink-0" />
                    </button>
                  </div>
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
            Không có dự án nào khớp với từ khóa &quot;{searchQuery}&quot;. Thử thay đổi bộ lọc hoặc tạo dự án mới.
          </p>
          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-purple-500/20 cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tạo Dự Án Mới Ngay
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        open={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSubmit={handleCreateProjectSubmit}
        form={createForm}
        onChange={(field, value) => setCreateForm((prev) => ({ ...prev, [field]: value }))}
      />
    </div>
  );
}

export default ReviewerProjectHubPage;
