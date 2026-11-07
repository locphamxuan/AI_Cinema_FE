'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileText, Feather, Film, Loader2 } from 'lucide-react';
import { productionService } from '@/services/productionService';
import type { ProjectSummary } from '@/types/production';
import { SHOWCASE_STUDIO_PROJECTS, INITIAL_STUDIO_METRICS } from './mockData';
import { StudioMetricBar } from './StudioMetricBar';
import { StudioFilterBar } from './StudioFilterBar';
import { CinematicProjectCard } from './CinematicProjectCard';
import { CinematicProjectTable } from './CinematicProjectTable';
import { RegisterProjectModal } from './RegisterProjectModal';
import type { ScriptFilterKey, ScriptProjectItem, ScreenwriterMetrics } from './types';

// Cinematic Sci-Fi Concept art fallbacks
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
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [userCreatedProjects, setUserCreatedProjects] = useState<ScriptProjectItem[]>([]);

  // Fetch real backend projects if available
  useEffect(() => {
    let mounted = true;
    async function fetchBackend() {
      setLoadingBackend(true);
      try {
        const res = await productionService.listProjects({ page: 1 });
        if (mounted && res?.data?.data) {
          setBackendProjects(res.data.data);
        }
      } catch (err) {
        console.warn('Backend projects fetch note:', err);
      } finally {
        if (mounted) setLoadingBackend(false);
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

  return (
    <div className="relative min-h-screen w-full bg-[#090B10] text-slate-100 font-sans transition-colors duration-200">
      {/* Ambient Cinema Glows (Obsidian Dark Mode) */}
      <div
        className="pointer-events-none absolute top-0 left-1/4 w-[600px] h-[350px] bg-[#E50914] opacity-[0.05] blur-[140px] rounded-full"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-32 right-1/4 w-[500px] h-[350px] bg-[#8B5CF6] opacity-[0.05] blur-[150px] rounded-full"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 1. Header & Quick Action Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.05] border border-white/10 text-slate-300 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
              <Feather className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Cổng Biên Kịch Nội Bộ • In-house Screenwriter Portal</span>
              {loadingBackend && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400 pl-2 border-l border-white/10">
                  <Loader2 className="w-3 h-3 animate-spin text-red-400" />
                  Đồng bộ dữ liệu...
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Quản Lý Dự Án & Kịch Bản Phân Cảnh
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Xây dựng kịch bản từ định hướng của Admin, nộp thẩm định nội dung trước khi chuyển giao sản xuất cho Studio ngoài.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-[#E50914] hover:bg-[#B81D24] shadow-lg shadow-red-950/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>+ Soạn Kịch Bản Mới</span>
            </button>
          </div>
        </header>

        {/* 2. Top Metric Bar */}
        <StudioMetricBar metrics={metrics} />

        {/* 3. Filter & Search Bar */}
        <StudioFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFilteredCount={filteredProjects.length}
        />

        {/* 4. Projects Content (Grid or Table) */}
        <section aria-label="Danh sách dự án kịch bản phân cảnh">
          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.12] p-12 text-center bg-[#111420]/60">
              <Film className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-white">Không tìm thấy kịch bản nào</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Không có dự án kịch bản nào khớp với bộ lọc hoặc từ khóa tìm kiếm. Hãy thử đổi trạng thái hoặc xóa từ khóa.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.08] text-white hover:bg-white/[0.12] transition-colors cursor-pointer"
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
      </div>

      {/* Modal Soạn Kịch Bản Mới */}
      <RegisterProjectModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onProjectRegistered={handleProjectRegistered}
      />
    </div>
  );
}
