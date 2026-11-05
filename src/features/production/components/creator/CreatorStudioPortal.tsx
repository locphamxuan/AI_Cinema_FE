'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Clapperboard, Film, Loader2 } from 'lucide-react';
import { productionService } from '@/services/productionService';
import type { ProjectSummary } from '@/types/production';
import { SHOWCASE_STUDIO_PROJECTS, INITIAL_STUDIO_METRICS } from './mockData';
import { StudioMetricBar } from './StudioMetricBar';
import { StudioFilterBar } from './StudioFilterBar';
import { CinematicProjectCard } from './CinematicProjectCard';
import { CinematicProjectTable } from './CinematicProjectTable';
import { RegisterProjectModal } from './RegisterProjectModal';
import type { StudioFilterKey, StudioProjectItem, StudioPortalMetrics } from './types';

// Sci-Fi Unsplash fallback posters for real backend projects lacking poster
const CYBER_POSTERS = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
];

export function CreatorStudioPortal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<StudioFilterKey>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [backendProjects, setBackendProjects] = useState<ProjectSummary[]>([]);
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [userCreatedProjects, setUserCreatedProjects] = useState<StudioProjectItem[]>([]);

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

  // Map real backend projects to StudioProjectItem
  const mappedBackendProjects = useMemo<StudioProjectItem[]>(() => {
    return backendProjects.map((p, idx) => {
      let status: StudioProjectItem['status'] = 'IN_REVIEW';
      let statusLabel = 'Chờ kiểm định Điều 44';

      if (p.status === 'COMPLETED') {
        status = 'PUBLISHED';
        statusLabel = 'Đang phát hành OTT';
      } else if (p.status === 'UNDER_REVISION') {
        status = 'REVISION';
        statusLabel = 'Cần sửa đổi bản dựng';
      } else if (p.status === 'DRAFT') {
        status = 'DRAFT';
        statusLabel = 'Bản nháp kịch bản';
      }

      const totalEpisodes = p._count?.episodes || 1;
      const approvedEpisodes = p.status === 'COMPLETED' ? totalEpisodes : Math.max(0, totalEpisodes - 1);

      return {
        id: p.id,
        title: p.title,
        tagline: p.studio ? `Dự án phối hợp cùng ${p.studio.name}` : 'Dự án sản xuất phim ứng dụng AI.',
        posterUrl: p.posterUrl || CYBER_POSTERS[idx % CYBER_POSTERS.length],
        status,
        movieStatus: p.status,
        statusLabel,
        genreTags: ['Sci-Fi', 'Điện Ảnh AI'],
        aiTools: ['Runway Gen-3', 'Midjourney v6'],
        approvedEpisodes,
        totalEpisodes,
        revenueCoin: 15000 + idx * 4500,
        studioName: p.studio?.name || 'Studio Partner',
        reviewerName: p.reviewer?.fullName || 'Reviewer',
        lastUpdatedText: 'Gần đây',
        complianceBadge: {
          status: p.status === 'COMPLETED' ? 'APPROVED' : 'PENDING',
          label: p.status === 'COMPLETED' ? 'Đạt kiểm định Điều 44' : 'Đang duyệt nhãn AI',
        },
      };
    });
  }, [backendProjects]);

  // Combined project pool: user created + 4 showcase + backend projects
  const allProjects = useMemo<StudioProjectItem[]>(() => {
    const combined = [...userCreatedProjects, ...SHOWCASE_STUDIO_PROJECTS];
    // Append mapped backend projects that aren't duplicates
    for (const bp of mappedBackendProjects) {
      if (!combined.some((item) => item.id === bp.id)) {
        combined.push(bp);
      }
    }
    return combined;
  }, [userCreatedProjects, mappedBackendProjects]);

  // Filter & Search
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      // Status filter
      if (activeFilter === 'published' && p.status !== 'PUBLISHED') return false;
      if (activeFilter === 'review' && p.status !== 'IN_REVIEW') return false;
      if (activeFilter === 'revision' && p.status !== 'REVISION') return false;
      if (activeFilter === 'draft' && p.status !== 'DRAFT') return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchGenre = p.genreTags.some((g) => g.toLowerCase().includes(query));
        const matchTools = p.aiTools.some((t) => t.toLowerCase().includes(query));
        const matchStudio = p.studioName?.toLowerCase().includes(query);
        if (!matchTitle && !matchGenre && !matchTools && !matchStudio) return false;
      }

      return true;
    });
  }, [allProjects, activeFilter, searchQuery]);

  // Dynamic Metrics
  const metrics: StudioPortalMetrics = useMemo(() => {
    const totalProjects = allProjects.length;
    const publishedEpisodes = allProjects.reduce(
      (sum, p) => (p.status === 'PUBLISHED' ? sum + p.totalEpisodes : sum),
      0
    );
    const pendingReviews = allProjects.filter((p) => p.status === 'IN_REVIEW').length;
    const totalRevenueCoins = allProjects.reduce((sum, p) => sum + (p.revenueCoin || 0), 0);

    return {
      totalProjects: Math.max(INITIAL_STUDIO_METRICS.totalProjects, totalProjects),
      publishedEpisodes: Math.max(INITIAL_STUDIO_METRICS.publishedEpisodes, publishedEpisodes),
      pendingReviews: Math.max(INITIAL_STUDIO_METRICS.pendingReviews, pendingReviews),
      totalRevenueCoins: Math.max(INITIAL_STUDIO_METRICS.totalRevenueCoins, totalRevenueCoins),
    };
  }, [allProjects]);

  // Destination link for cards: if it's a real project id use it, else link to first real project if available
  const firstRealId = backendProjects[0]?.id || 'showcase-cyber-saigon-2077';
  const getProjectHref = (p: StudioProjectItem) => {
    if (p.id.includes('-') && p.id.length > 20 && !p.id.startsWith('showcase-')) {
      return `/creator/projects/${p.id}`;
    }
    // For demo showcase items, link to first real project or id
    return `/creator/projects/${firstRealId}`;
  };

  const handleProjectRegistered = (newProj: StudioProjectItem) => {
    setUserCreatedProjects((prev) => [newProj, ...prev]);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0A0D14] text-slate-100 font-sans selection:bg-[#E50914] selection:text-white">
      {/* Ambient Cinema Glows */}
      <div
        className="pointer-events-none absolute top-0 left-1/4 w-[600px] h-[350px] bg-[#E50914] opacity-[0.04] blur-[140px] rounded-full"
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.05] border border-white/10 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
              <Clapperboard className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Studio Partner Portal • Chế Độ Điện Ảnh</span>
              {loadingBackend && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400 pl-2 border-l border-white/10">
                  <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                  Đồng bộ dữ liệu...
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Studio Partner Portal
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Quản lý danh mục phim, nộp hồ sơ phát hành và kiểm soát tuân thủ AI theo Điều 44.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#E50914] via-[#D10813] to-[#8B5CF6] hover:opacity-95 shadow-lg shadow-red-900/30 hover:shadow-red-800/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Đăng Ký Dự Án Phim</span>
            </button>
          </div>
        </header>

        {/* 2. Top Metric Bar (Replaces old bloated charts) */}
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
        <section aria-label="Danh sách dự án phim">
          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.12] p-12 text-center bg-[#131722]/50">
              <Film className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-white">Không tìm thấy dự án nào</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Không có phim nào khớp với bộ lọc hoặc từ khóa tìm kiếm. Hãy thử đổi trạng thái hoặc xóa từ khóa.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.08] text-white hover:bg-white/[0.12] transition-colors"
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

      {/* Register Project Modal */}
      <RegisterProjectModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onProjectRegistered={handleProjectRegistered}
      />
    </div>
  );
}
