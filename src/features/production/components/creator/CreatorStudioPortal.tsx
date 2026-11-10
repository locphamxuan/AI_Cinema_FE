'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  BookOpen,
  Handshake,
  Heart,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Layers,
  Calendar,
  Share2,
  CheckCircle2,
  Clock,
  Edit3,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { productionService } from '@/services/productionService';
import type { ProjectSummary } from '@/types/production';
import { SHOWCASE_STUDIO_PROJECTS, INITIAL_STUDIO_METRICS } from './mockData';
import { StudioFilterBar } from './StudioFilterBar';
import { CinematicProjectCard } from './CinematicProjectCard';
import { CinematicProjectTable } from './CinematicProjectTable';
import { RegisterProjectModal } from './RegisterProjectModal';
import type { ScriptFilterKey, ScriptProjectItem, ScreenwriterMetrics } from './types';

const CYBER_CONCEPT_ARTS = [
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
];

export function CreatorStudioPortal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ScriptFilterKey>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [backendProjects, setBackendProjects] = useState<ProjectSummary[]>([]);
  const [userCreatedProjects, setUserCreatedProjects] = useState<ScriptProjectItem[]>([]);
  const [timeRange, setTimeRange] = useState('30d');
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Fetch real backend projects if available
  useEffect(() => {
    let mounted = true;
    async function fetchBackend() {
      try {
        const res = await productionService.listProjects({ page: 1 });
        if (mounted && res?.data?.data) {
          setBackendProjects(res.data.data);
        }
      } catch (err) {
        console.warn('Backend projects fetch note:', err);
      }
    }
    fetchBackend();
    return () => {
      mounted = false;
    };
  }, []);

  // Map real backend projects to ScriptProjectItem
  const mappedBackendProjects = useMemo<ScriptProjectItem[]>(() => {
    return backendProjects.map((p, idx) => {
      let status: ScriptProjectItem['status'] = 'IN_REVIEW';
      let statusLabel = 'CHỜ DUYỆT KỊCH BẢN';

      if (p.status === 'COMPLETED') {
        status = 'HANDED_OFF';
        statusLabel = 'ĐÃ KÝ HỢP ĐỒNG SẢN XUẤT';
      } else if (p.status === 'UNDER_REVISION') {
        status = 'REVISION';
        statusLabel = 'CẦN CHỈNH SỬA PHÂN CẢNH';
      } else if (p.status === 'DRAFT') {
        status = 'DRAFT';
        statusLabel = 'BẢN NHÁP KỊCH BẢN';
      }

      const totalEpisodes = p._count?.episodes || 1;
      const completedScriptEpisodes = p.status === 'COMPLETED' ? totalEpisodes : Math.max(0, totalEpisodes - 1);

      return {
        id: p.id,
        title: p.title,
        tagline: p.studio ? `Dự án kịch bản chuyển giao cùng ${p.studio.name}` : 'Dự án kịch bản phân cảnh chuẩn OTT.',
        conceptArtUrl: p.posterUrl || CYBER_CONCEPT_ARTS[idx % CYBER_CONCEPT_ARTS.length],
        posterUrl: p.posterUrl || CYBER_CONCEPT_ARTS[idx % CYBER_CONCEPT_ARTS.length],
        status,
        movieStatus: p.status,
        statusLabel,
        genreTags: ['Sci-Fi', 'Điện Ảnh AI'],
        totalEpisodes,
        completedScriptEpisodes,
        assignedBy: 'Admin System',
        assignedDate: 'Gần đây',
        partnerStudioName: p.studio?.name || 'Chưa chuyển giao Studio',
        contractStatus: p.status === 'COMPLETED' ? 'Đã ký HĐ sản xuất' : 'Đang phát triển kịch bản',
        reviewerName: p.reviewer?.fullName || 'Reviewer Phụ Trách',
        lastUpdatedText: 'Gần đây',
        notes: p.studio ? `Dự án phân cảnh phối hợp cùng ${p.studio.name}` : 'Kịch bản phân cảnh chuẩn OTT',
        approvedEpisodes: completedScriptEpisodes,
        revenueCoin: 15000 + idx * 4500,
        studioName: p.studio?.name || 'Chưa chọn Studio',
      };
    });
  }, [backendProjects]);

  // Combined project pool: user created + showcase + backend projects
  const allProjects = useMemo<ScriptProjectItem[]>(() => {
    const combined = [...userCreatedProjects, ...SHOWCASE_STUDIO_PROJECTS];
    for (const bp of mappedBackendProjects) {
      if (!combined.some((item) => item.id === bp.id)) {
        combined.push(bp);
      }
    }
    return combined;
  }, [userCreatedProjects, mappedBackendProjects]);

  // Filter & Search based on Screenwriter status
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      if (activeFilter === 'draft' && p.status !== 'DRAFT') return false;
      if (activeFilter === 'review' && p.status !== 'IN_REVIEW' && p.status !== 'REVISION') return false;
      if (activeFilter === 'admin_approval' && p.status !== 'ADMIN_APPROVED') return false;
      if (activeFilter === 'handed_off' && p.status !== 'HANDED_OFF' && p.status !== 'NEGOTIATING') return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchGenre = p.genreTags.some((g) => g.toLowerCase().includes(query));
        const matchStudio = p.partnerStudioName?.toLowerCase().includes(query) || p.studioName?.toLowerCase().includes(query);
        if (!matchTitle && !matchGenre && !matchStudio) return false;
      }

      return true;
    });
  }, [allProjects, activeFilter, searchQuery]);

  // Dynamic Screenwriter Metrics
  const metrics: ScreenwriterMetrics = useMemo(() => {
    const totalProjects = allProjects.length;
    const pendingReviews = allProjects.filter((p) => p.status === 'IN_REVIEW').length;
    const revisionNeeded = allProjects.filter((p) => p.status === 'REVISION').length;
    const handedOffProjects = allProjects.filter(
      (p) => p.status === 'HANDED_OFF' || p.status === 'NEGOTIATING'
    ).length;

    return {
      totalProjects: Math.max(INITIAL_STUDIO_METRICS.totalProjects, totalProjects),
      pendingReviews: Math.max(INITIAL_STUDIO_METRICS.pendingReviews, pendingReviews),
      revisionNeeded: Math.max(INITIAL_STUDIO_METRICS.revisionNeeded, revisionNeeded),
      handedOffProjects: Math.max(INITIAL_STUDIO_METRICS.handedOffProjects, handedOffProjects),
    };
  }, [allProjects]);

  const firstRealId = backendProjects[0]?.id || 'showcase-cyber-saigon-2077';
  const getProjectHref = (p: ScriptProjectItem) => {
    if (p.id.includes('-') && p.id.length > 20 && !p.id.startsWith('showcase-')) {
      return `/creator/projects/${p.id}`;
    }
    return `/creator/projects/${firstRealId}`;
  };

  const handleProjectRegistered = (newProj: ScriptProjectItem) => {
    setUserCreatedProjects((prev) => [newProj, ...prev]);
  };

  const handleSharePage = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Đã sao chép liên kết trang', 'Liên kết hồ sơ biên kịch đã sẵn sàng chia sẻ.');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F9FAFB] dark:bg-[#0D0F17] text-[#111827] dark:text-slate-100 font-sans p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── 1. Top Profile Greeting Card (Buy Me a Coffee style) ── */}
        <section
          aria-label="Hồ sơ biên kịch"
          className="rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all"
        >
          <div className="flex items-center gap-4">
            {/* Avatar circle */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-white/20 shrink-0 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                alt="Avatar Screenwriter"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name & Handle */}
            <div className="space-y-0.5">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Hi, Biên Kịch Nội Bộ
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                aicinema.vn/creator/<span className="text-slate-700 dark:text-slate-300 font-semibold">@screenwriter</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleSharePage}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-slate-500 dark:text-slate-300" />
              <span>Chia sẻ trang</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#121212] hover:bg-black text-white dark:bg-white dark:text-[#121212] dark:hover:bg-slate-100 text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Soạn Kịch Bản Mới</span>
            </button>
          </div>
        </section>

        {/* ── 2. "Earnings" style Metric Card: Tiến Độ Kịch Bản & Phân Cảnh ── */}
        <section
          aria-label="Thống kê kịch bản phân cảnh"
          className="rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 p-7 shadow-xs space-y-5 transition-all"
        >
          {/* Top Row: Title + Time Filter */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Tiến Độ Kịch Bản
            </h2>

            {/* Time Filter Dropdown Pill */}
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                aria-label="Chọn khoảng thời gian"
                className="appearance-none rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 pl-4 pr-8 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                <option value="30d">30 ngày qua</option>
                <option value="quarter">Quý này (Quý IV)</option>
                <option value="all">Tất cả thời gian</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Big Number Headline */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
                {metrics.totalProjects}
              </span>
              <span className="text-base font-bold text-slate-500 dark:text-slate-400">
                Dự án kịch bản được giao
              </span>
            </div>
          </div>

          {/* Legend Dots Bar (Exact Buy Me a Coffee style colored breakdown) */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {/* Dot 1: Amber - Chờ Reviewer */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <span>{metrics.pendingReviews} Chờ Reviewer duyệt</span>
            </div>

            {/* Dot 2: Rose - Cần chỉnh sửa */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
              <span>{metrics.revisionNeeded} Cần hiệu đính phân cảnh</span>
            </div>

            {/* Dot 3: Emerald - Đã chuyển giao */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span>{metrics.handedOffProjects} Đã chuyển giao Studio</span>
            </div>

            {/* Dot 4: Slate - Bản nháp */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
              <span>Bản nháp đang viết</span>
            </div>
          </div>
        </section>

        {/* ── 3. Friendly Empty/Welcome Box (Buy Me a Coffee style heart card) ── */}
        <section
          aria-label="Khởi tạo kịch bản mới"
          className="rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 p-10 sm:p-12 text-center shadow-xs space-y-4"
        >
          {/* Centered Soft Circular Icon */}
          <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-400/10 border border-amber-200/60 dark:border-amber-400/20 mx-auto flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
            <Heart className="w-6 h-6 fill-amber-400/30" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Bạn đã sẵn sàng cho kịch bản tiếp theo chưa?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Khởi tạo hồ sơ kịch bản phân cảnh từ brief định hướng của Admin hoặc quản lý danh mục kịch bản bên dưới.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Khởi tạo kịch bản phân cảnh mới</span>
            </button>
          </div>
        </section>

        {/* ── 4. Filter & Search Bar ── */}
        <StudioFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFilteredCount={filteredProjects.length}
        />

        {/* ── 5. Script Projects Content (Grid or Table) ── */}
        <section aria-label="Danh sách dự án kịch bản">
          {filteredProjects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 dark:border-white/10 p-12 text-center bg-white dark:bg-[#141724]">
              <FileText className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Không tìm thấy kịch bản nào</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Không có dự án kịch bản nào khớp với bộ lọc hoặc từ khóa tìm kiếm.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="mt-4 px-4 py-2 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:text-white transition-colors cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <CinematicProjectCard
                  key={project.id}
                  project={project}
                  href={getProjectHref(project)}
                />
              ))}
            </div>
          ) : (
            <CinematicProjectTable
              projects={filteredProjects}
              getHref={getProjectHref}
            />
          )}
        </section>

        {/* ── 6. Bottom "More ways to earn" in BMC -> "Tiện ích & Hỗ trợ biên kịch" ── */}
        <section aria-label="Tiện ích và công cụ biên kịch" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Tiện ích & Hỗ trợ biên kịch</span>
            </h3>

            {/* Carousel navigation arrows */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCarouselIndex((prev) => Math.max(0, prev - 1))}
                aria-label="Xem trước"
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#141724] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCarouselIndex((prev) => Math.min(1, prev + 1))}
                aria-label="Xem tiếp"
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#141724] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Thư viện kịch bản */}
            <Link
              href="/creator/scripts"
              className="rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 p-5 shadow-xs hover:shadow-md transition-all space-y-3 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Thư Viện Kịch Bản Phân Cảnh
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Lưu trữ các phiên bản Final Draft, act breakdown và xuất bản tệp PDF cho từng tập.
                </p>
              </div>
            </Link>

            {/* Card 2: Tiến độ chuyển giao Studio */}
            <Link
              href="/creator/studio-handoff"
              className="rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 p-5 shadow-xs hover:shadow-md transition-all space-y-3 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-center shadow-xs">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Tiến Độ Chuyển Giao Studio
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Theo dõi hợp đồng gia công phim và tình trạng bàn giao storyboard cho Studio ngoài.
                </p>
              </div>
            </Link>

            {/* Card 3: Character Bible & Worldbuilding */}
            <div className="rounded-3xl bg-white dark:bg-[#141724] border border-slate-200/80 dark:border-white/10 p-5 shadow-xs space-y-3 group">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Character Bible & Worldbuilding
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Tài liệu chuẩn hóa bối cảnh nghệ thuật và tiểu sử nhân vật cho các hoạ sĩ Studio ngoài.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── 7. Floating Help Button (Exact Buy Me a Coffee style '?' button) ── */}
      <button
        type="button"
        onClick={() => {
          toast.info(
            'Hỗ trợ biên kịch nội bộ',
            'Đội ngũ Admin và Reviewer luôn sẵn sàng hỗ trợ phản hồi phân cảnh kịch bản của bạn.'
          );
        }}
        aria-label="Trợ giúp"
        title="Trợ giúp & Hướng dẫn biên kịch"
        className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 shadow-xl flex items-center justify-center font-bold text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        <span className="text-base font-extrabold font-mono">?</span>
      </button>

      {/* Modal Soạn Kịch Bản Mới */}
      <RegisterProjectModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onProjectRegistered={handleProjectRegistered}
      />
    </div>
  );
}
