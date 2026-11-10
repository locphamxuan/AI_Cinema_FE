'use client';

import { useState } from 'react';
import {
  Plus,
  Rocket,
  ShieldCheck,
  Building2,
  FileSignature,
  Clapperboard,
  ChevronDown,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  Film,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { CreateB2BProjectModal } from './CreateB2BProjectModal';
import { CreateContractModal } from './CreateContractModal';
import { SignContractModal } from './SignContractModal';
import { AdminOverviewDashboard } from './AdminOverviewDashboard';

interface PublishReadyMovie {
  id: string;
  title: string;
  episodesCount: number;
  thumbnailUrl: string;
  studioName: string;
  reviewerName: string;
  genre: string;
  complianceArticle44: boolean;
  published: boolean;
}

const INITIAL_READY_MOVIES: PublishReadyMovie[] = [
  {
    id: 'mov-cyber-saigon',
    title: 'Cyber Saigon 2077: Mạng Lưới Ngầm',
    episodesCount: 5,
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    studioName: 'Saigon VFX Lab',
    reviewerName: 'Trần Gia Huy',
    genre: 'Sci-Fi / Cyberpunk',
    complianceArticle44: true,
    published: false,
  },
  {
    id: 'mov-neo-hanoi',
    title: 'Mạng Lưới Sinh Học: Neo Hanoi 2085',
    episodesCount: 4,
    thumbnailUrl: 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=800&q=80',
    studioName: 'Ares Animation Studio',
    reviewerName: 'Nguyễn Văn Nam',
    genre: 'Bio-Thriller / AI',
    complianceArticle44: true,
    published: false,
  },
];

export function AdminExecutivePortal() {
  const [activeTab, setActiveTab] = useState<'b2b_projects' | 'analytics_charts'>('b2b_projects');
  const [timeRange, setTimeRange] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateContractOpen, setIsCreateContractOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);
  const [readyMovies, setReadyMovies] = useState<PublishReadyMovie[]>(INITIAL_READY_MOVIES);

  const [metrics, setMetrics] = useState({
    totalProjects: 12,
    streamedMovies: 5,
    activeContracts: 3,
    pendingFinalScripts: 2,
    awaitingPublish: 2,
  });

  const handleProjectCreated = () => {
    setMetrics((prev) => ({
      ...prev,
      totalProjects: prev.totalProjects + 1,
      pendingFinalScripts: prev.pendingFinalScripts + 1,
    }));
  };

  const handleContractSigned = () => {
    setContractSigned(true);
    setMetrics((prev) => ({
      ...prev,
      activeContracts: prev.activeContracts + 1,
    }));
  };

  const handlePublishMovie = (movieId: string, movieTitle: string) => {
    setReadyMovies((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, published: true } : m))
    );
    setMetrics((prev) => ({
      ...prev,
      streamedMovies: prev.streamedMovies + 1,
      awaitingPublish: Math.max(0, prev.awaitingPublish - 1),
    }));
    toast.success(
      'Phát Hành Thành Công!',
      `Tác phẩm "${movieTitle}" đã chính thức lên sóng kho phim OTT AI Cinema và xuất hiện tại Trang Chủ.`
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] dark:bg-[#090B10] text-[#0F172A] dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ── TẦNG 1A: Cụm Pill Tabs trên cùng (Contra Pill Switcher) ── */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('b2b_projects')}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'b2b_projects'
                ? 'bg-[#121212] dark:bg-white text-white dark:text-[#121212] shadow-sm'
                : 'bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.08]'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5" />
            <span>Quản trị Dự án & B2B</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics_charts')}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'analytics_charts'
                ? 'bg-[#121212] dark:bg-white text-white dark:text-[#121212] shadow-sm'
                : 'bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.08]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Biểu đồ Doanh thu & OTT</span>
          </button>
        </div>

        {activeTab === 'analytics_charts' ? (
          <AdminOverviewDashboard />
        ) : (
          <>
            {/* ── TẦNG 1B: Profile Box (Contra White Rounded-3xl Card) ── */}
            <section
              aria-label="Hồ sơ quản trị viên"
              className="rounded-3xl bg-[#FFFFFF] dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#121212] dark:bg-white text-white dark:text-[#121212] flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
                  A
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
                      Quản Trị Viên Hệ Thống
                    </h1>
                    <span className="bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
                      Executive Admin
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
                    admin@aicinema.vn • <span className="font-medium text-[#0F172A] dark:text-slate-300">B2B Studio Contract & Release Authority</span>
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#121212] dark:bg-white text-white dark:text-[#121212] hover:bg-black dark:hover:bg-slate-100 rounded-full px-5 py-2.5 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Khởi Tạo Dự Án Mới</span>
                </button>
              </div>
            </section>

            {/* ── TẦNG 2: Thẻ Thống Kê Tổng Quan (Metrics Card) ── */}
            <section
              aria-label="Thống kê dự án và hợp đồng"
              className="rounded-3xl bg-[#FFFFFF] dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-7 shadow-sm space-y-5 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white tracking-tight">
                  Dự Án & Hợp Đồng Đang Chạy
                </h2>

                <div className="relative">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    aria-label="Khoảng thời gian thống kê"
                    className="appearance-none rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] pl-4 pr-8 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#121212] cursor-pointer"
                  >
                    <option value="all">Toàn bộ thời gian</option>
                    <option value="quarter">Quý này (Quý IV)</option>
                    <option value="30d">30 ngày qua</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
                  {metrics.totalProjects}
                </span>
                <span className="text-sm sm:text-base font-medium text-[#64748B] dark:text-slate-400">
                  Dự án phim điện ảnh AI trong hệ thống
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.06] text-xs font-medium text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span><strong className="text-[#0F172A] dark:text-white">{metrics.streamedMovies}</strong> Phim đã lên sóng OTT</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                  <span><strong className="text-[#0F172A] dark:text-white">{metrics.activeContracts}</strong> Hợp đồng đã ký với Studio</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                  <span><strong className="text-[#0F172A] dark:text-white">{metrics.pendingFinalScripts}</strong> Kịch bản chờ Admin duyệt Final</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span><strong className="text-[#0F172A] dark:text-white">{metrics.awaitingPublish}</strong> Phim đang chờ Publish lên trang chủ</span>
                </div>
              </div>
            </section>

            {/* ── TẦNG 3: Card Ký Duyệt Hợp Đồng Studio (E-Contract Action Card) ── */}
            <section
              aria-label="Ký duyệt hợp đồng Studio mới nhất"
              className="rounded-3xl bg-[#FFFFFF] dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="bg-slate-100 dark:bg-white/[0.06] p-3.5 rounded-2xl text-[#0F172A] dark:text-white shrink-0">
                  <FileSignature className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                      Ký Duyệt Hợp Đồng Studio Mới Nhất
                    </span>
                    {contractSigned ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 text-xs px-3 py-0.5 rounded-full font-medium">
                        Đã ký điện tử
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30 text-xs px-3 py-0.5 rounded-full font-medium">
                        Chờ Admin ký duyệt
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">
                    Dự án: Cyber Saigon 2077 • Đối tác: Saigon VFX Studio
                  </h3>

                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                    Báo giá đề xuất: <strong className="text-[#0F172A] dark:text-white font-semibold">150,000,000 VND</strong> (Trọn bộ 5 tập 4K Master). Kịch bản phân cảnh đã được Reviewer xác nhận.
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-start lg:self-center flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateContractOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-[#121212] dark:bg-white text-white dark:text-[#121212] hover:bg-black dark:hover:bg-slate-100 rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo Hợp Đồng Mẫu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(true)}
                  className="inline-flex items-center gap-2 border border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                >
                  <span>{contractSigned ? 'Xem Lại Hợp Đồng Số' : 'Xem Báo Giá & Ký Số'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>

            {/* ── TẦNG 4: Danh Sách Phim Chờ Phát Hành OTT (Ready to Publish) ── */}
            <section aria-label="Phim đã kiểm định pháp lý" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
                    <Film className="w-5 h-5 text-[#0F172A] dark:text-white" />
                    <span>Phim Đã Kiểm Định Pháp Lý — Sẵn Sàng Phát Hành</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
                    Các tác phẩm đã được Reviewer đối soát kỹ thuật, hoàn tất nghĩa vụ bản quyền và gắn nhãn Tuân thủ AI (Điều 44).
                  </p>
                </div>

                <span className="self-start sm:self-auto rounded-full bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 px-3.5 py-1 text-xs font-medium border border-slate-200/80 dark:border-white/10">
                  {readyMovies.filter((m) => !m.published).length} Tác phẩm chờ lên sóng
                </span>
              </div>

              {/* Horizontal Action Cards */}
              <div className="space-y-3">
                {readyMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="rounded-2xl bg-[#FFFFFF] dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:shadow-md transition-all"
                  >
                    {/* Khối 1: Thumbnail + Title */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200/60 dark:border-white/[0.08]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={movie.thumbnailUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-sm text-[10px] font-medium text-white">
                          {movie.episodesCount} Tập
                        </span>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                          {movie.genre}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white truncate">
                          {movie.title}
                        </h4>
                        <p className="text-xs text-[#64748B] dark:text-slate-400">
                          Reviewer: <span className="font-medium text-[#0F172A] dark:text-slate-200">{movie.reviewerName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Khối 2: Badge Điều 44 + Studio */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 text-xs px-3 py-1 rounded-full font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Đã gắn nhãn AI Điều 44</span>
                      </span>

                      <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-200 text-xs px-3 py-1 rounded-full font-medium">
                        <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>Studio: {movie.studioName}</span>
                      </span>
                    </div>

                    {/* Khối 3: Ultimate Publish Button */}
                    <div className="shrink-0">
                      {movie.published ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Đã Lên Sóng OTT</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePublishMovie(movie.id, movie.title)}
                          className="inline-flex items-center gap-2 bg-[#121212] dark:bg-white text-white dark:text-[#121212] hover:bg-[#E50914] hover:text-white dark:hover:bg-[#E50914] dark:hover:text-white rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
                        >
                          <Rocket className="w-4 h-4" />
                          <span>Bấm Phát Hành Lên OTT</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Modals */}
      <CreateB2BProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <SignContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        onContractSigned={handleContractSigned}
      />

      <CreateContractModal
        isOpen={isCreateContractOpen}
        onClose={() => setIsCreateContractOpen(false)}
        onCreated={() => {
          setContractSigned(false);
        }}
      />
    </div>
  );
}
